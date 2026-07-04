import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class SupportService {
  constructor(private readonly db: InMemoryDbService) {}

  create(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const ticket = {
      id: this.db.id('ticket'),
      user_id: currentActor.id,
      subject: String(body.subject ?? ''),
      priority: String(body.priority ?? 'normal'),
      status: 'open',
      created_at: this.db.now(),
      updated_at: this.db.now(),
    };
    this.db.supportTickets.unshift(ticket);
    return ticket;
  }

  list(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.db.supportTickets.filter(
      (ticket) => ticket['user_id'] === currentActor.id,
    );
  }

  findOne(actor: RequestActor | undefined, id: string) {
    const ticket = this.assertTicket(actor, id);
    return {
      ...ticket,
      messages: this.db.supportMessages.filter(
        (message) => message['ticket_id'] === id,
      ),
    };
  }

  message(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertTicket(actor, id);
    const currentActor = this.db.actorOrDemo(actor);
    const message = {
      id: this.db.id('support_msg'),
      ticket_id: id,
      sender_type: currentActor.actorType,
      sender_id: currentActor.id,
      body: String(body.body ?? ''),
      created_at: this.db.now(),
    };
    this.db.supportMessages.push(message);
    return message;
  }

  status(
    actor: RequestActor | undefined,
    id: string,
    status: 'open' | 'closed',
  ) {
    const ticket = this.assertTicket(actor, id);
    ticket['status'] = status;
    ticket['updated_at'] = this.db.now();
    return ticket;
  }

  private assertTicket(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const ticket = this.db.supportTickets.find((item) => item['id'] === id);
    if (!ticket) {
      throw new NotFoundException({
        code: 'VALIDATION_ERROR',
        message: 'Ticket topilmadi',
      });
    }

    if (
      currentActor.role !== Role.SUPER_ADMIN &&
      currentActor.actorType !== 'admin' &&
      ticket['user_id'] !== currentActor.id
    ) {
      throw new ForbiddenException({
        code: 'SUPPORT_FORBIDDEN',
        message: 'Bu ticket sizga tegishli emas',
      });
    }

    return ticket;
  }
}
