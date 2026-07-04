import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class UploadsService {
  constructor(private readonly db: InMemoryDbService) {}

  create(
    actor: RequestActor | undefined,
    type: 'image' | 'document',
    body: Record<string, unknown>,
  ) {
    const currentActor = this.db.actorOrDemo(actor);
    const mimeType = String(body.mime_type ?? body.mimeType ?? '');
    const size = Number(body.size ?? 0);
    this.assertUploadAllowed(type, mimeType, size);
    const file = {
      id: this.db.id('file'),
      owner_id: currentActor.id,
      type,
      filename: this.safeFilename(String(body.filename ?? `${type}.bin`)),
      mime_type: mimeType,
      size,
      object_key: `${currentActor.actorType}/${currentActor.id}/${this.db.id(type)}`,
      url: `https://cdn.uzbron.uz/mock/${type}/${Date.now()}`,
      created_at: this.db.now(),
    };
    this.db.uploads.unshift(file);
    return file;
  }

  presign(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const type =
      String(body.type ?? 'image') === 'document' ? 'document' : 'image';
    const mimeType = String(body.mime_type ?? body.mimeType ?? '');
    const size = Number(body.size ?? 0);
    this.assertUploadAllowed(type, mimeType, size);
    return {
      owner_id: currentActor.id,
      upload_url: `https://storage.uzbron.uz/mock-presign/${this.db.id('upload')}`,
      method: 'PUT',
      fields: {},
      expires_in_seconds: 900,
      filename: this.safeFilename(String(body.filename ?? `${type}.bin`)),
      mime_type: mimeType,
      max_size: this.maxSize(type),
    };
  }

  delete(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const file = this.db.uploads.find((item) => item['id'] === id);
    if (!file) {
      throw new NotFoundException({
        code: 'UPLOAD_NOT_FOUND',
        message: 'Fayl topilmadi',
      });
    }

    if (
      currentActor.role !== Role.SUPER_ADMIN &&
      currentActor.actorType !== 'admin' &&
      file['owner_id'] !== currentActor.id
    ) {
      throw new ForbiddenException({
        code: 'UPLOAD_FORBIDDEN',
        message: 'Bu fayl sizga tegishli emas',
      });
    }

    file['deleted_at'] = this.db.now();
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
