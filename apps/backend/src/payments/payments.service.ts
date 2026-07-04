import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import {
  InMemoryDbService,
  type PaymentMethod,
  type PaymentRecord,
} from '../infrastructure/in-memory-db.service';
import {
  hmacSha256,
  mockPaymentsEnabled,
  paymentWebhookSecret,
  timingSafeEqualString,
} from '../auth/security';

type HeaderMap = Record<string, string | string[] | undefined>;

@Injectable()
export class PaymentsService {
  constructor(private readonly db: InMemoryDbService) {}

  payment(actor: RequestActor | undefined, bookingId: string) {
    this.assertBookingVisible(actor, bookingId);
    const payment = this.db.findPaymentByBooking(bookingId);
    if (!payment) {
      throw new NotFoundException({
        code: 'PAYMENT_PROVIDER_ERROR',
        message: 'Payment topilmadi',
      });
    }

    return payment;
  }

  createPayment(
    actor: RequestActor | undefined,
    bookingId: string,
    body: Record<string, unknown>,
  ) {
    const booking = this.assertBookingVisible(actor, bookingId);
    return this.db.createPayment(booking, this.provider(body.provider));
  }

  providerWebhook(
    provider: string,
    event: string,
    body: Record<string, unknown>,
    headers: HeaderMap = {},
  ) {
    if (!mockPaymentsEnabled()) {
      throw new ServiceUnavailableException({
        code: 'PAYMENT_PROVIDER_NOT_CONFIGURED',
        message: 'Payment provider rasmiy webhook integratsiyasi ulanmagan',
      });
    }

    const eventKey = this.eventKey(provider, event, body);
    this.verifySignature(provider, event, eventKey, body, headers);

    const payloadHash = hmacSha256(
      this.stableStringify(body),
      paymentWebhookSecret() ?? 'uzbron-development-payment-secret',
    );
    const duplicate = this.db.paymentEvents.find(
      (item) => item.provider === provider && item.event_key === eventKey,
    );
    if (duplicate) {
      return {
        provider,
        event,
        accepted: true,
        duplicate: true,
        payment: duplicate.payment_id
          ? this.db.payments.find(
              (payment) => payment.id === duplicate.payment_id,
            )
          : undefined,
        processed_at: duplicate.processed_at,
      };
    }

    const bookingId = String(
      body.booking_id ?? body.bookingId ?? body.account ?? '',
    );
    const payment = bookingId
      ? this.db.findPaymentByBooking(bookingId)
      : undefined;

    if (!payment) {
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Webhook uchun payment topilmadi',
      });
    }

    this.assertPaymentMatchesPayload(payment, body);
    payment.status = event === 'prepare' ? 'processing' : 'paid';
    payment.provider_reference = String(
      body.transaction_id ?? body.id ?? eventKey,
    );
    payment.updated_at = this.db.now();

    const processedAt = this.db.now();
    this.db.paymentEvents.unshift({
      id: this.db.id('payment_event'),
      provider,
      event_key: eventKey,
      event_type: event,
      payload_hash: payloadHash,
      booking_id: bookingId,
      payment_id: payment.id,
      processed_at: processedAt,
    });

    return {
      provider,
      event,
      accepted: true,
      duplicate: false,
      payment,
      processed_at: processedAt,
    };
  }

  private assertBookingVisible(
    actor: RequestActor | undefined,
    bookingId: string,
  ) {
    const booking = this.db.findBooking(bookingId);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }

    if (
      !actor ||
      actor.role === Role.SUPER_ADMIN ||
      actor.actorType === 'admin'
    ) {
      return booking;
    }

    if (actor.actorType === 'user' && booking.user_id === actor.id) {
      return booking;
    }

    if (
      actor.actorType === 'partner' &&
      booking.partner_organization_id === actor.organizationId
    ) {
      return booking;
    }

    throw new ForbiddenException({
      code: 'BOOKING_FORBIDDEN',
      message: 'Bu bron sizga tegishli emas',
    });
  }

  private verifySignature(
    provider: string,
    event: string,
    eventKey: string,
    body: Record<string, unknown>,
    headers: HeaderMap,
  ) {
    const secret =
      paymentWebhookSecret() ?? 'uzbron-development-payment-secret';
    const signature = this.firstHeader(
      headers['x-uzbron-mock-signature'] ??
        headers['x-uzbron-signature'] ??
        headers['x-signature'],
    );

    if (!signature) {
      throw new UnauthorizedException({
        code: 'PAYMENT_SIGNATURE_INVALID',
        message: 'Webhook signature yuborilmagan',
      });
    }

    const canonical = `${provider}.${event}.${eventKey}.${this.stableStringify(
      body,
    )}`;
    const expected = hmacSha256(canonical, secret);
    if (!timingSafeEqualString(signature, expected)) {
      throw new UnauthorizedException({
        code: 'PAYMENT_SIGNATURE_INVALID',
        message: 'Webhook signature noto‘g‘ri',
      });
    }
  }

  private eventKey(
    provider: string,
    event: string,
    body: Record<string, unknown>,
  ): string {
    const value =
      body.event_id ??
      body.eventId ??
      body.transaction_id ??
      body.id ??
      body.booking_id ??
      body.bookingId;
    return `${provider}:${event}:${String(value ?? '')}`;
  }

  private assertPaymentMatchesPayload(
    payment: PaymentRecord,
    body: Record<string, unknown>,
  ) {
    const amount = body.amount ?? body.total_amount;
    if (amount !== undefined && Number(amount) !== payment.amount) {
      throw new UnprocessableEntityException({
        code: 'PAYMENT_AMOUNT_MISMATCH',
        message: 'Webhook summasi payment bilan mos emas',
      });
    }

    const currency = body.currency
      ? String(body.currency).toUpperCase()
      : 'UZS';
    if (currency !== payment.currency) {
      throw new UnprocessableEntityException({
        code: 'PAYMENT_CURRENCY_MISMATCH',
        message: 'Webhook valyutasi payment bilan mos emas',
      });
    }
  }

  private stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }

    if (value && typeof value === 'object') {
      return `{${Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(
          ([key, entry]) =>
            `${JSON.stringify(key)}:${this.stableStringify(entry)}`,
        )
        .join(',')}}`;
    }

    return JSON.stringify(value);
  }

  private firstHeader(
    value: string | string[] | undefined,
  ): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }

  private provider(value: unknown): PaymentMethod {
    const provider = String(value ?? 'click') as PaymentMethod;
    return ['click', 'payme', 'uzcard', 'humo', 'cash'].includes(provider)
      ? provider
      : 'click';
  }
}
