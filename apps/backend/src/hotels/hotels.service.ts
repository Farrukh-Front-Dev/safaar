import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginatedObject,
  parsePagination,
  type QueryLike,
} from '../common/pagination';
import { AppCacheService } from '../infrastructure/cache.service';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

@Injectable()
export class HotelsService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly db: InMemoryDbService,
  ) {}

  findAll(query: QueryLike) {
    return this.cache.getOrSet(`hotels:list:${cacheKey(query)}`, 60, () => {
      return this.findAllFresh(query);
    });
  }

  private findAllFresh(query: QueryLike) {
    const pagination = parsePagination(query, 'public', {
      allowedSortBy: ['created_at', 'rating_average', 'stars', 'min_price'],
      defaultSortBy: 'rating_average',
    });
    const roomsByHotel = new Map<
      string,
      Array<(typeof this.db.rooms)[number]>
    >();
    for (const room of this.db.rooms) {
      const hotelRooms = roomsByHotel.get(room.hotel_id) ?? [];
      hotelRooms.push(room);
      roomsByHotel.set(room.hotel_id, hotelRooms);
    }
    const citiesById = new Map(this.db.cities.map((city) => [city.id, city]));

    const hotels = this.db.hotels.filter((hotel) => {
      if (hotel.status !== 'published') {
        return false;
      }

      if (query.city_id && hotel.city_id !== first(query.city_id)) {
        return false;
      }

      if (query.stars && hotel.stars !== Number(first(query.stars))) {
        return false;
      }

      if (
        query.rating &&
        hotel.rating_average < Number(first(query.rating) ?? 0)
      ) {
        return false;
      }

      const rooms = roomsByHotel.get(hotel.id) ?? [];
      const minPrice = minRoomPrice(rooms);
      if (
        query.min_price &&
        Number.isFinite(minPrice) &&
        minPrice < Number(first(query.min_price))
      ) {
        return false;
      }
      if (
        query.max_price &&
        Number.isFinite(minPrice) &&
        minPrice > Number(first(query.max_price))
      ) {
        return false;
      }

      return true;
    });

    const mapped = hotels.map((hotel) => {
      const minPrice = minRoomPrice(roomsByHotel.get(hotel.id) ?? []);
      return {
        ...hotel,
        city: citiesById.get(hotel.city_id),
        min_price: Number.isFinite(minPrice) ? minPrice : 0,
      };
    });
    const sorted = mapped.sort((left, right) => {
      const leftValue = valueForSort(left, pagination.sortBy);
      const rightValue = valueForSort(right, pagination.sortBy);
      const direction = pagination.order === 'asc' ? 1 : -1;
      return (leftValue - rightValue) * direction;
    });

    return paginatedObject(sorted, pagination);
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

  async map(query: QueryLike) {
    const hotels = await this.findAll(query);
    return hotels.items.map((hotel) => ({
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

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function minRoomPrice(rooms: Array<{ base_price: number }>): number {
  return Math.min(...rooms.map((room) => room.base_price));
}

function valueForSort(
  hotel: {
    created_at?: string;
    rating_average?: number;
    stars?: number;
    min_price?: number;
  },
  sortBy: string,
): number {
  if (sortBy === 'created_at') {
    return Date.parse(hotel.created_at ?? '') || 0;
  }

  return Number(hotel[sortBy as 'rating_average' | 'stars' | 'min_price'] ?? 0);
}

function cacheKey(query: QueryLike): string {
  return Object.keys(query)
    .sort()
    .map(
      (key) => `${key}=${encodeURIComponent(String(first(query[key]) ?? ''))}`,
    )
    .join('&');
}
