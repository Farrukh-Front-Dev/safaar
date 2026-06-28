import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class HotelsService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll(query: Record<string, string | undefined>) {
    const hotels = this.db.hotels.filter((hotel) => {
      if (hotel.status !== 'published') {
        return false;
      }

      if (query.city_id && hotel.city_id !== query.city_id) {
        return false;
      }

      if (query.stars && hotel.stars !== Number(query.stars)) {
        return false;
      }

      return true;
    });

    return {
      items: hotels.map((hotel) => this.toPublicHotel(hotel.id)),
      total: hotels.length,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    };
  }

  findOne(slugOrId: string) {
    const hotel = this.db.hotels.find(
      (item) => item.id === slugOrId || item.slug === slugOrId,
    );

    if (!hotel || hotel.status !== 'published') {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }

    return {
      ...this.toPublicHotel(hotel.id),
      rooms: this.rooms(hotel.id),
    };
  }

  rooms(id: string) {
    this.assertHotel(id);
    return this.db.rooms
      .filter((room) => room.hotel_id === id && room.status === 'active')
      .map((room) => ({
        ...room,
        available: room.total_inventory,
      }));
  }

  quote(id: string, body: Record<string, unknown>) {
    this.assertHotel(id);
    const roomId = String(body.room_id ?? this.rooms(id)[0]?.id ?? '');
    const room = this.db.rooms.find((item) => item.id === roomId);

    if (!room || room.hotel_id !== id) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Xona mavjud emas',
      });
    }

    const checkIn = String(body.check_in ?? '');
    const checkOut = String(body.check_out ?? '');
    const nights = this.calculateNights(checkIn, checkOut);
    const roomsCount = Number(body.rooms ?? 1);
    const subtotal = room.base_price * nights * roomsCount;

    return {
      quote_id: this.db.id('quote'),
      hotel_id: id,
      room,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      rooms: roomsCount,
      currency: 'UZS',
      subtotal,
      discount_amount: 0,
      service_fee: 0,
      total_amount: subtotal,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    };
  }

  reviews(id: string) {
    this.assertHotel(id);
    return this.db.reviews.filter((review) => review['target_id'] === id);
  }

  map(query: Record<string, string | undefined>) {
    return this.findAll(query).items.map((hotel) => ({
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      rating_average: hotel.rating_average,
      min_price: hotel.min_price,
    }));
  }

  private toPublicHotel(id: string) {
    const hotel = this.assertHotel(id);
    const rooms = this.db.rooms.filter((room) => room.hotel_id === hotel.id);
    const minPrice = Math.min(...rooms.map((room) => room.base_price));

    return {
      ...hotel,
      city: this.db.cities.find((city) => city.id === hotel.city_id),
      min_price: Number.isFinite(minPrice) ? minPrice : 0,
    };
  }

  private assertHotel(id: string) {
    const hotel = this.db.hotels.find((item) => item.id === id);

    if (!hotel) {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }

    return hotel;
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = Date.parse(checkIn);
    const end = Date.parse(checkOut);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return 1;
    }

    return Math.max(1, Math.ceil((end - start) / 86_400_000));
  }
}
