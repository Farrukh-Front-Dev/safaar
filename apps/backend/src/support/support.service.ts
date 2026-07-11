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
export class SupportService {
  constructor(private readonly pg: PostgresService) {}

  async create(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const now = new Date().toISOString();
    const id = randomUUID();

    const [ticket] = await this.pg.query(
      `INSERT INTO support_tickets (id, user_id, subject, priority, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        currentActor.id,
        String(body.subject ?? ''),
        String(body.priority ?? 'normal'),
        'open',
        now,
        now,
      ],
    );

    return ticket;
  }

  async list(actor: RequestActor | undefined) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const tickets = await this.pg.query(
      'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [currentActor.id],
    );

    return tickets;
  }

  async findOne(actor: RequestActor | undefined, id: string) {
    const ticket = await this.assertTicket(actor, id);

    const messages = await this.pg.query(
      'SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
      [id],
    );

    return {
      ...ticket,
      messages,
    };
  }

  async message(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertTicket(actor, id);
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const now = new Date().toISOString();
    const messageId = randomUUID();

    const [message] = await this.pg.query(
      `INSERT INTO support_messages (id, ticket_id, sender_type, sender_id, body, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        messageId,
        id,
        currentActor.actorType,
        currentActor.id,
        String(body.body ?? ''),
        now,
      ],
    );

    return message;
  }

  async status(
    actor: RequestActor | undefined,
    id: string,
    status: 'open' | 'closed',
  ) {
    await this.assertTicket(actor, id);
    const now = new Date().toISOString();

    const [ticket] = await this.pg.query(
      `UPDATE support_tickets
       SET status = $1, updated_at = $2
       WHERE id = $3
       RETURNING *`,
      [status, now, id],
    );

    return ticket;
  }

  private async assertTicket(actor: RequestActor | undefined, id: string) {
    const currentActor: RequestActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const [ticket] = await this.pg.query(
      'SELECT * FROM support_tickets WHERE id = $1',
      [id],
    );

    if (!ticket) {
      throw new NotFoundException({
        code: 'VALIDATION_ERROR',
        message: 'Ticket topilmadi',
      });
    }

    if (
      currentActor.role !== Role.SUPER_ADMIN &&
      currentActor.actorType !== 'admin' &&
      ticket.user_id !== currentActor.id
    ) {
      throw new ForbiddenException({
        code: 'SUPPORT_FORBIDDEN',
        message: 'Bu ticket sizga tegishli emas',
      });
    }

    return ticket;
  }
}
