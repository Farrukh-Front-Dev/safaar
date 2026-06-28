import { ForbiddenException, Injectable } from '@nestjs/common';
import { BookingStatus } from '@agoda/types';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

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
    return this.bookings(apiKey).find((booking) => booking.id === id) ?? { id };
  }

  bookingStatus(
    apiKey: string | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const booking = this.db.findBooking(id);
    this.organizationId(apiKey);

    if (booking && body.status === 'completed') {
      booking.status = BookingStatus.COMPLETED;
      booking.updated_at = this.db.now();
    }

    return booking ?? { id, status: body.status };
  }

  hotels(apiKey: string | undefined) {
    const organizationId = this.organizationId(apiKey);
    return this.db.hotels.filter(
      (hotel) => hotel.partner_organization_id === organizationId,
    );
  }

  trips(apiKey: string | undefined) {
    this.organizationId(apiKey);
    return this.db.trips;
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

    const key = this.db.partnerApiKeys.find(
      (item) => item['secret'] === apiKey || item['key_prefix'] === apiKey,
    );

    return String(key?.['organization_id'] ?? 'demo-partner-org-id');
  }
}
