import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SERVER_EVENTS } from './events';

/**
 * Central event bus for real-time WebSocket broadcasts.
 * Services call emit() after mutations; the gateway forwards to connected clients.
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly emitter: EventEmitter2) {}

  /** Notification created for a specific user */
  notificationCreated(userId: string, notification: Record<string, unknown>) {
    this.emitter.emit(SERVER_EVENTS.NOTIFICATION_CREATED, {
      userId,
      notification,
    });
  }

  /** Booking status changed — notify user + partner + admin */
  bookingStatusChanged(
    booking: Record<string, unknown>,
    previousStatus?: string,
  ) {
    this.emitter.emit(SERVER_EVENTS.BOOKING_STATUS_CHANGED, {
      booking,
      previousStatus,
      userId: booking['user_id'],
      partnerId: booking['partner_organization_id'],
    });
  }

  /** Payment status changed */
  paymentStatusChanged(payment: Record<string, unknown>) {
    this.emitter.emit(SERVER_EVENTS.PAYMENT_STATUS_CHANGED, { payment });
  }

  /** Support message created — notify ticket participants */
  supportMessageCreated(
    ticketId: string,
    message: Record<string, unknown>,
    ticket: Record<string, unknown>,
  ) {
    this.emitter.emit(SERVER_EVENTS.SUPPORT_MESSAGE_CREATED, {
      ticketId,
      message,
      ticket,
      partnerId: ticket['actor_type'] === 'partner' ? ticket['actor_id'] : null,
      userId: ticket['user_id'],
    });
  }

  /** Support ticket status changed */
  supportTicketUpdated(ticket: Record<string, unknown>) {
    this.emitter.emit(SERVER_EVENTS.SUPPORT_TICKET_UPDATED, {
      ticket,
      partnerId: ticket['actor_type'] === 'partner' ? ticket['actor_id'] : null,
      userId: ticket['user_id'],
    });
  }

  /** Booking message created */
  bookingMessageCreated(
    bookingId: string,
    message: Record<string, unknown>,
    partnerId?: string,
  ) {
    this.emitter.emit(SERVER_EVENTS.BOOKING_MESSAGE_CREATED, {
      bookingId,
      message,
      partnerId,
    });
  }

  /** Partner dashboard should refresh */
  partnerDashboardUpdated(partnerId: string) {
    this.emitter.emit(SERVER_EVENTS.PARTNER_DASHBOARD_UPDATED, { partnerId });
  }

  /** Admin dashboard should refresh */
  adminDashboardUpdated() {
    this.emitter.emit(SERVER_EVENTS.ADMIN_DASHBOARD_UPDATED, {});
  }
}
