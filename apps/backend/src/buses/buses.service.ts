import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class BusesService {
  constructor(private readonly db: InMemoryDbService) {}

  routes() {
    return this.db.busRoutes.map((route) => ({
      ...route,
      from_city: this.db.cities.find((city) => city.id === route.from_city_id),
      to_city: this.db.cities.find((city) => city.id === route.to_city_id),
    }));
  }

  trips(query: Record<string, string | undefined>) {
    return this.db.trips
      .filter((trip) => {
        if (query.from_city_id && trip.from_city_id !== query.from_city_id) {
          return false;
        }

        if (query.to_city_id && trip.to_city_id !== query.to_city_id) {
          return false;
        }

        return trip.status === 'scheduled';
      })
      .map((trip) => this.tripSummary(trip.id));
  }

  trip(id: string) {
    const summary = this.tripSummary(id);
    if (!summary) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }

    return summary;
  }

  seats(id: string) {
    this.trip(id);
    return this.db.tripSeats.filter((seat) => seat.trip_id === id);
  }

  quote(id: string, body: Record<string, unknown>) {
    const seats = Array.isArray(body.seats)
      ? body.seats.map(String)
      : this.seats(id)
          .filter((seat) => seat.status === 'available')
          .slice(0, 1)
          .map((seat) => seat.seat_code);
    const selectedSeats = this.seats(id).filter((seat) =>
      seats.includes(seat.seat_code),
    );
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return {
      quote_id: this.db.id('quote'),
      trip_id: id,
      seats: selectedSeats,
      currency: 'UZS',
      subtotal,
      service_fee: 0,
      total_amount: subtotal,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    };
  }

  companyReviews(id: string) {
    const company = this.db.busCompanies.find((item) => item.id === id);
    if (!company) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Avtobus kompaniyasi topilmadi',
      });
    }

    return this.db.reviews.filter((review) => review['target_id'] === id);
  }

  private tripSummary(id: string) {
    const trip = this.db.trips.find((item) => item.id === id);
    if (!trip) {
      return undefined;
    }

    const availableSeats = this.db.tripSeats.filter(
      (seat) => seat.trip_id === id && seat.status === 'available',
    ).length;

    return {
      ...trip,
      route: this.db.busRoutes.find((route) => route.id === trip.route_id),
      company: this.db.busCompanies.find(
        (company) => company.id === trip.company_id,
      ),
      from_city: this.db.cities.find((city) => city.id === trip.from_city_id),
      to_city: this.db.cities.find((city) => city.id === trip.to_city_id),
      available_seats: availableSeats,
    };
  }
}
