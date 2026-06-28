import { Injectable, NotFoundException } from '@nestjs/common';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class RefundsService {
  constructor(private readonly db: InMemoryDbService) {}

  create(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const bookingId = String(body.booking_id ?? '');
    const booking = this.db.findBooking(bookingId);

    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }

    const refund = {
      id: this.db.id('refund'),
      booking_id: bookingId,
      user_id: currentActor.id,
      status: 'requested',
      currency: booking.currency,
      requested_amount: Math.round(booking.total_amount * 0.8),
      reason: String(body.reason ?? ''),
      created_at: this.db.now(),
      updated_at: this.db.now(),
    };
    this.db.refunds.unshift(refund);
    return refund;
  }

  findOne(id: string) {
    const refund = this.db.refunds.find((item) => item['id'] === id);
    if (!refund) {
      throw new NotFoundException({
        code: 'REFUND_NOT_ALLOWED',
        message: 'Refund topilmadi',
      });
    }

    return refund;
  }

  mine(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.db.refunds.filter(
      (refund) => refund['user_id'] === currentActor.id,
    );
  }
}
