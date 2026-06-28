import { Injectable } from '@nestjs/common';
import type {
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentProvider,
  PaymentWebhookResult,
} from './payment-provider.interface';
import type { PaymentMethod } from '../../infrastructure/in-memory-db.service';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  constructor(public readonly provider: PaymentMethod) {}

  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return Promise.resolve({
      provider: this.provider,
      providerReference: `mock_${this.provider}_${input.bookingId}`,
      paymentUrl:
        this.provider === 'cash'
          ? undefined
          : `https://pay.uzbron.uz/mock/${this.provider}/${input.bookingId}`,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    });
  }

  verifyWebhook(): Promise<boolean> {
    return Promise.resolve(true);
  }

  parseWebhook(body: Record<string, unknown>): Promise<PaymentWebhookResult> {
    return Promise.resolve({
      provider: this.provider,
      providerReference: String(
        body.transaction_id ?? body.id ?? 'mock-transaction',
      ),
      status: String(body.status ?? 'paid') === 'failed' ? 'failed' : 'paid',
      bookingId: body.booking_id ? String(body.booking_id) : undefined,
      amount: body.amount ? Number(body.amount) : undefined,
      raw: body,
    });
  }
}
