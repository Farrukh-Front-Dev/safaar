import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginatedObject,
  parsePagination,
  type QueryLike,
} from '../common/pagination';
import { AppCacheService } from '../infrastructure/cache.service';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class HotelsService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly db: InMemoryDbService,
    private readonly pg: PostgresService,
  ) {}

  async findAll(query: QueryLike) {
    return this.cache.getOrSet(`hotels:list:${cacheKey(query)}`, 60, () => {
      return this.findAllFresh(query);
    });
  }

  private async findAllFresh(query: QueryLike) {
    const pgResult = await this.pg.tryQuery(
      `SELECT h.id, h.partner_organization_id, h.slug, h.city_id,
        h.address, h.latitude, h.longitude, h.stars,
        h.rating_average, h.reviews_count, h.status,
        h.check_in_time, h.check_out_time,
        h.created_at, h.updated_at,
        ht.name, ht.description,
        c.name as city_name, c.region_id,
        rp.min_price
      FROM hotels h
      LEFT JOIN hotel_translations ht ON ht.hotel_id = h.id AND ht.language = 'uz'
      LEFT JOIN cities c ON c.id = h.city_id
      LEFT JOIN (SELECT hotel_id, MIN(base_price) as min_price FROM hotel_rooms WHERE status = 'active' GROUP BY hotel_id) rp ON rp.hotel_id = h.id
      WHERE h.status = 'published'
      ${query.city_id ? 'AND h.city_id = $1' : ''}
      ${query.stars ? `AND h.stars = ${Number(query.stars)}` : ''}
      ORDER BY h.rating_average DESC`,
      query.city_id ? [query.city_id] : [],
    );

    if (pgResult) {
      const mapped = pgResult.map((row: Record<string, unknown>) => {
        const r = row as Record<string, unknown>;
        return {
          id: r.id,
          partner_organization_id: r.partner_organization_id,
          slug: r.slug,
          city_id: r.city_id,
          address: r.address,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          stars: Number(r.stars),
          rating_average: Number(r.rating_average),
          reviews_count: Number(r.reviews_count),
          status: r.status,
          check_in_time: r.check_in_time,
          check_out_time: r.check_out_time,
          created_at: r.created_at,
          updated_at: r.updated_at,
          name: { uz: r.name, ru: r.name, en: r.name },
          description: { uz: r.description, ru: r.description, en: r.description },
          city: { id: r.city_id, region_id: r.region_id, name: r.city_name },
          amenities: [],
          images: [],
          min_price: Number(r.min_price || 0),
        };
      });

      const pagination = parsePagination(query, 'public', {
        allowedSortBy: ['created_at', 'rating_average', 'stars', 'min_price'],
        defaultSortBy: 'rating_average',
      });

      return paginatedObject(mapped, pagination);
    }

    return this.findAllFreshInMemory(query);
  }

  private findAllFreshInMemory(query: QueryLike) {
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

  async findOne(slugOrId: string) {
    const pgResult = await this.pg.tryQuery(
      `SELECT h.id, h.partner_organization_id, h.slug, h.city_id,
        h.address, h.latitude, h.longitude, h.stars,
        h.rating_average, h.reviews_count, h.status,
        h.check_in_time, h.check_out_time,
        h.created_at, h.updated_at,
        ht.name, ht.description,
        c.name as city_name, c.region_id
      FROM hotels h
      LEFT JOIN hotel_translations ht ON ht.hotel_id = h.id AND ht.language = 'uz'
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE (h.id::text = $1 OR h.slug = $1) AND h.status = 'published'`,
      [slugOrId],
    );

    if (pgResult && pgResult.length > 0) {
      const h = pgResult[0] as Record<string, unknown>;
      const roomRows = await this.pg.tryQuery(
        `SELECT hr.id, hr.hotel_id, hr.room_type_id, hr.code,
          hr.base_occupancy, hr.max_adults, hr.max_children,
          hr.total_inventory, hr.base_price, hr.status
        FROM hotel_rooms hr
        WHERE hr.hotel_id = $1 AND hr.status = 'active'`,
        [h.id],
      );
      const rooms = (roomRows ?? []).map((r: Record<string, unknown>) => ({
        id: r.id,
        hotel_id: r.hotel_id,
        room_type_id: r.room_type_id,
        code: r.code,
        base_occupancy: Number(r.base_occupancy),
        max_adults: Number(r.max_adults),
        max_children: Number(r.max_children),
        total_inventory: Number(r.total_inventory),
        base_price: Number(r.base_price),
        status: r.status,
        available: Number(r.total_inventory),
      }));

      return {
        id: h.id,
        partner_organization_id: h.partner_organization_id,
        slug: h.slug,
        city_id: h.city_id,
        address: h.address,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        stars: Number(h.stars),
        rating_average: Number(h.rating_average),
        reviews_count: Number(h.reviews_count),
        status: h.status,
        check_in_time: h.check_in_time,
        check_out_time: h.check_out_time,
        created_at: h.created_at,
        updated_at: h.updated_at,
        name: { uz: h.name, ru: h.name, en: h.name },
        description: { uz: h.description, ru: h.description, en: h.description },
        city: { id: h.city_id, region_id: h.region_id, name: h.city_name },
        amenities: [],
        images: [],
        rooms,
      };
    }

    return this.findOneInMemory(slugOrId);
  }

  private findOneInMemory(slugOrId: string) {
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

  async rooms(id: string) {
    const pgResult = await this.findRoomsPg(id);
    if (pgResult) return pgResult;

    return this.roomsInMemory(id);
  }

  private async findRoomsPg(hotelId: string) {
    const pgResult = await this.pg.tryQuery(
      `SELECT hr.id, hr.hotel_id, hr.room_type_id, hr.code,
        hr.base_occupancy, hr.max_adults, hr.max_children,
        hr.total_inventory, hr.base_price, hr.status
      FROM hotel_rooms hr
      WHERE hr.hotel_id = $1 AND hr.status = 'active'`,
      [hotelId],
    );

    if (!pgResult) return null;

    return pgResult.map((r: Record<string, unknown>) => ({
      id: r.id,
      hotel_id: r.hotel_id,
      room_type_id: r.room_type_id,
      code: r.code,
      base_occupancy: Number(r.base_occupancy),
      max_adults: Number(r.max_adults),
      max_children: Number(r.max_children),
      total_inventory: Number(r.total_inventory),
      base_price: Number(r.base_price),
      status: r.status,
      available: Number(r.total_inventory),
    }));
  }

  private roomsInMemory(id: string) {
    this.assertHotel(id);
    return this.db.rooms
      .filter((room) => room.hotel_id === id && room.status === 'active')
      .map((room) => ({
        ...room,
        available: room.total_inventory,
      }));
  }

  async quote(id: string, body: Record<string, unknown>) {
    const rooms = await this.rooms(id);
    const roomId = String(body.room_id ?? rooms[0]?.id ?? '');
    const room = rooms.find((item) => item.id === roomId);

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Xona mavjud emas',
      });
    }

    const checkIn = String(body.check_in ?? '');
    const checkOut = String(body.check_out ?? '');
    const nights = this.calculateNights(checkIn, checkOut);
    const roomsCount = Number(body.rooms ?? 1);
    const subtotal = Number(room.base_price) * nights * roomsCount;

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

  async reviews(id: string) {
    const pgResult = await this.pg.tryQuery(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.target_type = 'hotel' AND r.target_id = $1 AND r.status = 'published'
       ORDER BY r.created_at DESC`,
      [id],
    );

    if (pgResult) return pgResult;

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
