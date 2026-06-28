import { Injectable } from '@nestjs/common';
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

  read(id: string) {
    const notification = this.db.notifications.find(
      (item) => item['id'] === id,
    ) ?? { id, read_at: null };
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

  deletePushToken(id: string) {
    return { id, deleted: true };
  }
}
