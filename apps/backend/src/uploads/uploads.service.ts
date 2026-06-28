import { Injectable } from '@nestjs/common';
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
    const file = {
      id: this.db.id('file'),
      owner_id: currentActor.id,
      type,
      filename: String(body.filename ?? `${type}.bin`),
      mime_type: String(body.mime_type ?? 'application/octet-stream'),
      size: Number(body.size ?? 0),
      url: `https://cdn.uzbron.uz/mock/${type}/${Date.now()}`,
      created_at: this.db.now(),
    };
    this.db.uploads.unshift(file);
    return file;
  }

  presign(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    return {
      owner_id: currentActor.id,
      upload_url: `https://storage.uzbron.uz/mock-presign/${this.db.id('upload')}`,
      method: 'PUT',
      fields: {},
      expires_in_seconds: 900,
      filename: body.filename,
    };
  }

  delete(id: string) {
    return { id, deleted: true };
  }
}
