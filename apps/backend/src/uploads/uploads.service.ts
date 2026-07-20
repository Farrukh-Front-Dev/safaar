import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@safaar/types';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { RequestActor } from '../common/actor';
import { PostgresService } from '../infrastructure/postgres.service';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class UploadsService {
  constructor(private readonly pg: PostgresService) {}

  async create(
    actor: RequestActor | undefined,
    type: 'image' | 'document',
    body: Record<string, unknown>,
    file?: UploadedFile,
  ) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    return this.storeMedia(
      currentActor.actorType,
      currentActor.id,
      type,
      body,
      file,
    );
  }

  async createForOwner(
    ownerType: string,
    ownerId: string,
    type: 'image' | 'document',
    body: Record<string, unknown>,
    file: UploadedFile,
  ) {
    return this.storeMedia(ownerType, ownerId, type, body, file);
  }

  presign(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const type =
      String(body.type ?? 'image') === 'document' ? 'document' : 'image';
    const mimeType = String(body.mime_type ?? body.mimeType ?? '');
    const size = Number(body.size ?? 0);
    this.assertUploadAllowed(type, mimeType, size);

    return {
      owner_id: currentActor.id,
      upload_url: `https://storage.uzbron.uz/mock-presign/${randomUUID()}`,
      method: 'PUT',
      fields: {},
      expires_in_seconds: 900,
      filename: this.safeFilename(String(body.filename ?? `${type}.bin`)),
      mime_type: mimeType,
      max_size: this.maxSize(type),
    };
  }

  async delete(actor: RequestActor | undefined, id: string) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const [file] = await this.pg.query(
      'SELECT * FROM media_files WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (!file) {
      throw new NotFoundException({
        code: 'UPLOAD_NOT_FOUND',
        message: 'Fayl topilmadi',
      });
    }

    if (
      currentActor.role !== Role.SUPER_ADMIN &&
      currentActor.actorType !== 'admin' &&
      file.owner_id !== currentActor.id
    ) {
      throw new ForbiddenException({
        code: 'UPLOAD_FORBIDDEN',
        message: 'Bu fayl sizga tegishli emas',
      });
    }

    await this.pg.query(
      'UPDATE media_files SET deleted_at = $1 WHERE id = $2',
      [new Date().toISOString(), id],
    );

    return { id, deleted: true };
  }

  private assertUploadAllowed(
    type: 'image' | 'document',
    mimeType: string,
    size: number,
  ) {
    const allowed =
      type === 'image'
        ? ['image/jpeg', 'image/png', 'image/webp']
        : ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowed.includes(mimeType)) {
      throw new BadRequestException({
        code: 'UPLOAD_MIME_NOT_ALLOWED',
        message: 'Fayl turi ruxsat etilmagan',
      });
    }

    if (!Number.isFinite(size) || size <= 0 || size > this.maxSize(type)) {
      throw new BadRequestException({
        code: 'UPLOAD_SIZE_INVALID',
        message: 'Fayl hajmi ruxsat etilgan chegaradan tashqarida',
      });
    }
  }

  private async storeMedia(
    ownerType: string,
    ownerId: string,
    type: 'image' | 'document',
    body: Record<string, unknown>,
    file?: UploadedFile,
  ) {
    const mimeType =
      file?.mimetype ?? String(body.mime_type ?? body.mimeType ?? '');
    const size = file?.size ?? Number(body.size ?? 0);
    this.assertUploadAllowed(type, mimeType, size);

    const id = randomUUID();
    const now = new Date().toISOString();
    const stored = file ? await this.persistFile(type, file) : undefined;
    const objectKey =
      stored?.objectKey ?? `${ownerType}/${ownerId}/${randomUUID()}`;
    const url =
      stored?.url ?? `https://cdn.uzbron.uz/mock/${type}/${Date.now()}`;

    try {
      const [media] = await this.pg.query(
        `INSERT INTO media_files (id, owner_type, owner_id, bucket, object_key, url, mime_type, size, visibility, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          id,
          ownerType,
          ownerId,
          type,
          objectKey,
          url,
          mimeType,
          size,
          stored ? 'public' : 'private',
          now,
        ],
      );
      return media;
    } catch (error) {
      if (stored) await unlink(stored.absolutePath).catch(() => undefined);
      throw error;
    }
  }

  private async persistFile(type: 'image' | 'document', file: UploadedFile) {
    const extension = this.extensionForMime(file.mimetype);
    const filename = `${randomUUID()}${extension}`;
    const relativePath = join(type, filename);
    const absolutePath = join(this.uploadRoot(), relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer, { flag: 'wx' });

    return {
      absolutePath,
      objectKey: relativePath,
      url: `${this.publicOrigin()}/uploads/${relativePath.replace(/\\/g, '/')}`,
    };
  }

  private uploadRoot(): string {
    return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
  }

  private publicOrigin(): string {
    return (
      process.env.PUBLIC_API_ORIGIN ??
      `http://localhost:${process.env.PORT ?? '4000'}`
    ).replace(/\/$/, '');
  }

  private extensionForMime(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'application/pdf':
        return '.pdf';
      default:
        return '.bin';
    }
  }

  private maxSize(type: 'image' | 'document'): number {
    return type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  }

  private safeFilename(value: string): string {
    return value
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }
}
