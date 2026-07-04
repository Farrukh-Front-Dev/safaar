import { ForbiddenException, Injectable } from '@nestjs/common';
import { BookingStatus } from '@agoda/types';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import {
  hashSecret,
  partnerApiPepper,
  timingSafeEqualString,
} from '../auth/security';

@Injectable()
export class PartnerApiService {
  constructor(private readonly db: InMemoryDbService) {}

  bookings(apiKey: string | undefined) {
    const organizationId = this.organizationId(apiKey);
    return this.db.bookings.filter(
      (booking) => booking.partner_organization_id === organizationId,
    );
  }

  booking(apiKey: string | undefined, id: string) {
    const booking = this.bookings(apiKey).find((item) => item.id === id);
    if (!booking) {
      throw new ForbiddenException({
        code: 'BOOKING_FORBIDDEN',
        message: 'Bu bron API key tashkilotiga tegishli emas',
      });
    }
    return booking;
  }

  bookingStatus(
    apiKey: string | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const organizationId = this.organizationId(apiKey);
    const booking = this.db.findBooking(id);
    if (!booking || booking.partner_organization_id !== organizationId) {
      throw new ForbiddenException({
        code: 'BOOKING_FORBIDDEN',
        message: 'Bu bron API key tashkilotiga tegishli emas',
      });
    }

    if (body.status === 'completed') {
      booking.status = BookingStatus.COMPLETED;
      booking.updated_at = this.db.now();
    }

    return booking;
  }

  hotels(apiKey: string | undefined) {
    const organizationId = this.organizationId(apiKey);
    return this.db.hotels.filter(
      (hotel) => hotel.partner_organization_id === organizationId,
    );
  }

  trips(apiKey: string | undefined) {
    const organizationId = this.organizationId(apiKey);
    const companyIds = new Set(
      this.db.busCompanies
        .filter((company) => company.partner_organization_id === organizationId)
        .map((company) => company.id),
    );
    return this.db.trips.filter((trip) => companyIds.has(trip.company_id));
  }

  webhookTest(apiKey: string | undefined, body: Record<string, unknown>) {
    this.organizationId(apiKey);
    return {
      event: body.event ?? 'booking.created',
      signature: 'mock-signature',
      delivered: true,
      delivered_at: this.db.now(),
    };
  }

  private organizationId(apiKey: string | undefined) {
    if (!apiKey) {
      throw new ForbiddenException({
        code: 'API_KEY_INVALID',
        message: 'Partner API key yaroqsiz',
      });
    }

    const key = this.db.partnerApiKeys.find((item) => {
      const prefix = String(item['key_prefix'] ?? '');
      const secretHash = String(item['secret_hash'] ?? '');
      return (
        prefix &&
        apiKey.startsWith(`${prefix}_`) &&
        timingSafeEqualString(secretHash, this.hashApiKey(apiKey))
      );
    });

    if (!key || key['status'] !== 'active') {
      throw new ForbiddenException({
        code: 'API_KEY_INVALID',
        message: 'Partner API key yaroqsiz',
      });
    }

    return String(key['organization_id']);
  }

  private hashApiKey(apiKey: string): string {
    return hashSecret(apiKey, partnerApiPepper());
  }
}
