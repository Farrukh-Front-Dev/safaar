import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class NotificationsService {
  private readonly pushTokens: Array<Record<string, unknown>> = [];

  constructor(private readonly db: InMemoryDbService) {}

  list(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.db.notifications.filter(
      (notification) => notification['owner_id'] === currentActor.id,
    );
  }

  read(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const notification = this.db.notifications.find(
      (item) => item['id'] === id,
    );
    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Xabarnoma topilmadi',
      });
    }
    this.assertOwner(currentActor, notification['owner_id']);
    notification['read_at'] = this.db.now();
    return notification;
  }

  readAll(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    for (const notification of this.db.notifications) {
      if (notification['owner_id'] === currentActor.id) {
        notification['read_at'] = this.db.now();
      }
    }

    return { owner_id: currentActor.id, read_all: true };
  }

  pushToken(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const token = {
      id: this.db.id('push'),
      owner_id: currentActor.id,
      token: String(body.token ?? ''),
      platform: String(body.platform ?? 'web'),
      created_at: this.db.now(),
    };
    this.pushTokens.unshift(token);
    return token;
  }

  deletePushToken(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const token = this.pushTokens.find((item) => item['id'] === id);
    if (!token) {
      throw new NotFoundException({
        code: 'PUSH_TOKEN_NOT_FOUND',
        message: 'Push token topilmadi',
      });
    }
    this.assertOwner(currentActor, token['owner_id']);
    token['deleted_at'] = this.db.now();
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
