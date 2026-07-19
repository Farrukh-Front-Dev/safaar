import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@Safaar/types';
import { hmacSha256 } from '../../src/auth/security';
import { AuthService } from '../../src/auth/auth.service';
import { buildActorFromHeaders } from '../../src/common/actor';
import { BookingsService } from '../../src/bookings/bookings.service';
import { InMemoryDbService } from '../../src/infrastructure/in-memory-db.service';
import { PartnerApiService } from '../../src/partner-api/partner-api.service';
import { PartnersService } from '../../src/partners/partners.service';
import { PaymentsService } from '../../src/payments/payments.service';
import { UsersService } from '../../src/users/users.service';

const userActor = {
  id: 'user-a',
  actorType: 'user' as const,
  role: Role.USER,
  roles: [Role.USER],
};

describe('Security regression tests', () => {
  beforeEach(() => {
    process.env.ENABLE_DEMO_AUTH = 'true';
    process.env.ENABLE_IN_MEMORY_DATA = 'true';
    process.env.ENABLE_MOCK_PAYMENTS = 'true';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-with-32-characters';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-with-32-characters';
    process.env.PAYMENT_WEBHOOK_SECRET = 'test-payment-secret-with-32-chars';
    process.env.PARTNER_API_KEY_PEPPER = 'test-partner-pepper-with-32-chars';
  });

  it('rejects client-controlled role headers unless demo auth is explicitly allowed', () => {
    const actor = buildActorFromHeaders({
      'x-user-role': 'SUPER_ADMIN',
      'x-user-id': 'attacker-controlled-id',
    });

    expect(actor).toBeUndefined();
  });

  it('rejects forged mock bearer tokens by default', () => {
    const actor = buildActorFromHeaders({
      authorization:
        'Bearer mock-access.attacker-controlled-id.SUPER_ADMIN.any',
    });

    expect(actor).toBeUndefined();
  });

  it('issues real JWTs and rotates refresh tokens', () => {
    const db = new InMemoryDbService();
    const auth = new AuthService(db, {
      tryQuery: () => Promise.resolve(null),
    });
    const otp = auth.sendUserOtp('+998901234567');
    const login = auth.verifyUserOtp({
      phone: '+998901234567',
      challenge_id: otp.challenge_id,
      code: otp.dev_code ?? '',
    });

    expect(login.accessToken.split('.')).toHaveLength(3);
    const actor = buildActorFromHeaders({
      authorization: `Bearer ${login.accessToken}`,
    });
    expect(actor).toMatchObject({ id: 'demo-user-id', role: Role.USER });

    const rotated = auth.refresh({ refresh_token: login.refreshToken });
    expect(rotated.refreshToken).not.toEqual(login.refreshToken);
    expect(() => auth.refresh({ refresh_token: login.refreshToken })).toThrow(
      UnauthorizedException,
    );
  });

  it('prevents /me booking lookup across users', () => {
    const db = new InMemoryDbService();
    const bookings = new BookingsService(db);
    const users = new UsersService(db);
    const { booking } = bookings.createHotel(userActor, {
      hotel_id: 'hotel-samarkand-plaza',
      room_id: 'room-standard-1',
      check_in: '2026-07-10',
      check_out: '2026-07-11',
    });

    expect(() =>
      users.booking(
        {
          id: 'user-b',
          actorType: 'user',
          role: Role.USER,
          roles: [Role.USER],
        },
        booking.id,
      ),
    ).toThrow(ForbiddenException);
  });

  it('requires signed, idempotent payment webhooks', () => {
    const db = new InMemoryDbService();
    const bookings = new BookingsService(db);
    const payments = new PaymentsService(db);
    const { booking } = bookings.createHotel(userActor, {
      hotel_id: 'hotel-samarkand-plaza',
      room_id: 'room-standard-1',
      check_in: '2026-07-10',
      check_out: '2026-07-11',
    });

    const body = {
      booking_id: booking.id,
      transaction_id: 'audit-test-transaction',
      amount: booking.total_amount,
      currency: 'UZS',
    };

    expect(() => payments.providerWebhook('click', 'complete', body)).toThrow(
      UnauthorizedException,
    );

    const eventKey = 'click:complete:audit-test-transaction';
    const canonical = `click.complete.${eventKey}.${stableStringify(body)}`;
    const signature = hmacSha256(
      canonical,
      process.env.PAYMENT_WEBHOOK_SECRET ?? '',
    );
    const first = payments.providerWebhook('click', 'complete', body, {
      'x-uzbron-mock-signature': signature,
    });
    const second = payments.providerWebhook('click', 'complete', body, {
      'x-uzbron-mock-signature': signature,
    });

    expect(first).toMatchObject({
      accepted: true,
      duplicate: false,
      payment: { status: 'paid' },
    });
    expect(second).toMatchObject({ accepted: true, duplicate: true });
  });

  it('does not fall back to the demo organization for invalid partner API keys', () => {
    const db = new InMemoryDbService();
    const partnerApi = new PartnerApiService(db);

    expect(() => partnerApi.bookings('definitely-not-a-valid-api-key')).toThrow(
      ForbiddenException,
    );
  });

  it('stores only partner API key hashes and accepts the one-time full key', () => {
    const db = new InMemoryDbService();
    const partners = new PartnersService(db);
    const partnerApi = new PartnerApiService(db);
    const result = partners.createApiKey(
      {
        id: 'demo-partner-user-id',
        actorType: 'partner',
        role: Role.PARTNER,
        roles: [Role.PARTNER],
        organizationId: 'demo-partner-org-id',
      },
      { name: 'Regression key' },
    );

    expect(result).toHaveProperty('api_key');
    expect(db.partnerApiKeys[0]).not.toHaveProperty('secret');
    expect(db.partnerApiKeys[0]).toHaveProperty('secret_hash');
    expect(partnerApi.bookings(String(result.api_key))).toEqual([]);
  });
});

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}
