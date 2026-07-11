import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import { randomUUID } from 'node:crypto';
import type { RequestActor } from '../common/actor';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class NotificationsService {
  private readonly pushTokens: Array<Record<string, unknown>> = [];

  constructor(private readonly pg: PostgresService) {}

  async list(actor: RequestActor | undefined) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const notifications = await this.pg.query(
      'SELECT * FROM notifications WHERE owner_id = $1 ORDER BY created_at DESC',
      [currentActor.id],
    );

    return notifications;
  }

  async read(actor: RequestActor | undefined, id: string) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const [notification] = await this.pg.query(
      'SELECT * FROM notifications WHERE id = $1',
      [id],
    );

    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Xabarnoma topilmadi',
      });
    }

    this.assertOwner(currentActor, notification.owner_id);

    const now = new Date().toISOString();
    const [updated] = await this.pg.query(
      'UPDATE notifications SET read_at = $1 WHERE id = $2 RETURNING *',
      [now, id],
    );

    return updated;
  }

  async readAll(actor: RequestActor | undefined) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const now = new Date().toISOString();
    await this.pg.query(
      'UPDATE notifications SET read_at = $1 WHERE owner_id = $2 AND read_at IS NULL',
      [now, currentActor.id],
    );

    return { owner_id: currentActor.id, read_all: true };
  }

  pushToken(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const token = {
      id: randomUUID(),
      owner_id: currentActor.id,
      token: String(body.token ?? ''),
      platform: String(body.platform ?? 'web'),
      created_at: new Date().toISOString(),
    };
    this.pushTokens.unshift(token);
    return token;
  }

  deletePushToken(actor: RequestActor | undefined, id: string) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const idx = this.pushTokens.findIndex((item) => item['id'] === id);
    if (idx === -1) {
      throw new NotFoundException({
        code: 'PUSH_TOKEN_NOT_FOUND',
        message: 'Push token topilmadi',
      });
    }

    const token = this.pushTokens[idx];
    this.assertOwner(currentActor, token['owner_id']);

    token['deleted_at'] = new Date().toISOString();
    return { id, deleted: true };
  }

  private assertOwner(actor: RequestActor, ownerId: unknown) {
    if (
      actor.role === Role.SUPER_ADMIN ||
      actor.actorType === 'admin' ||
      ownerId === actor.id
    ) {
      return;
    }

    throw new ForbiddenException({
      code: 'RESOURCE_FORBIDDEN',
      message: 'Bu resurs sizga tegishli emas',
    });
  }
}
