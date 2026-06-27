import type { PaymentMethod } from '../../infrastructure/in-memory-db.service';

export interface PaymentIntentInput {
  bookingId: string;
  amount: number;
  currency: 'UZS';
  returnUrl?: string;
}

export interface PaymentIntentResult {
  provider: PaymentMethod;
  providerReference: string;
  paymentUrl?: string;
  expiresAt?: string;
}

export interface PaymentWebhookResult {
  provider: PaymentMethod;
  providerReference: string;
  status: 'processing' | 'paid' | 'failed' | 'refunded';
  bookingId?: string;
  amount?: number;
  raw: unknown;
}

export interface PaymentProvider {
  readonly provider: PaymentMethod;
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): Promise<boolean>;
  parseWebhook(body: unknown): Promise<PaymentWebhookResult>;
}
