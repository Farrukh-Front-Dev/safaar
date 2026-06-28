import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InMemoryDbService,
  type PaymentMethod,
} from '../infrastructure/in-memory-db.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: InMemoryDbService) {}

  payment(bookingId: string) {
    const payment = this.db.findPaymentByBooking(bookingId);
    if (!payment) {
      throw new NotFoundException({
        code: 'PAYMENT_PROVIDER_ERROR',
        message: 'Payment topilmadi',
      });
    }

    return payment;
  }

  createPayment(bookingId: string, body: Record<string, unknown>) {
    const booking = this.db.findBooking(bookingId);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }

    return this.db.createPayment(booking, this.provider(body.provider));
  }

  providerWebhook(
    provider: string,
    event: string,
    body: Record<string, unknown>,
  ) {
    const bookingId = String(
      body.booking_id ?? body.bookingId ?? body.account ?? '',
    );
    const payment = bookingId
      ? this.db.findPaymentByBooking(bookingId)
      : undefined;

    if (payment) {
      payment.status = event === 'prepare' ? 'processing' : 'paid';
      payment.provider_reference = String(
        body.transaction_id ?? body.id ?? this.db.id('trx'),
      );
      payment.updated_at = this.db.now();
    }

    return {
      provider,
      event,
      accepted: true,
      payment,
      processed_at: this.db.now(),
    };
  }

  private provider(value: unknown): PaymentMethod {
    const provider = String(value ?? 'click') as PaymentMethod;
    return ['click', 'payme', 'uzcard', 'humo', 'cash'].includes(provider)
      ? provider
      : 'click';
  }
}
