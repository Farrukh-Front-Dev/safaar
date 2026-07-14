import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginatedObject,
  parsePagination,
  type QueryLike,
} from '../common/pagination';
import { AppCacheService } from '../infrastructure/cache.service';
import { PostgresService } from '../infrastructure/postgres.service';

@Injectable()
export class HotelsService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly pg: PostgresService,
  ) {}

  async findAll(query: QueryLike) {
    return this.cache.getOrSet(`hotels:list:${cacheKey(query)}`, 60, () => {
      return this.findAllFresh(query);
    });
  }

  private async findAllFresh(query: QueryLike) {
    const conditions = [
      "h.status = 'published'",
      'h.deleted_at IS NULL',
      "po.status = 'approved'",
    ];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.city_id) {
      conditions.push(`h.city_id = $${paramIndex++}`);
      params.push(query.city_id);
    }

    if (query.stars) {
      conditions.push(`h.stars = $${paramIndex++}`);
      params.push(Number(query.stars));
    }

    if (query.featured === 'true') {
      conditions.push('h.featured = true');
    }

    if (query.min_rating) {
      conditions.push(`h.rating_average >= $${paramIndex++}`);
      params.push(Number(query.min_rating));
    }

    const rows = await this.pg.query(
      `SELECT h.id::text, h.partner_organization_id::text, h.slug, h.city_id::text,
        h.address, h.latitude::float8, h.longitude::float8, h.stars,
        h.rating_average::float8, h.reviews_count, h.status::text, h.featured,
        h.check_in_time, h.check_out_time,
        h.created_at, h.updated_at,
        ht.name, ht.description,
        c.name as city_name, c.region_id::text,
        rp.min_price::float8
      FROM hotels h
      JOIN partner_organizations po ON po.id = h.partner_organization_id
      LEFT JOIN hotel_translations ht ON ht.hotel_id = h.id AND ht.language = 'uz'
      LEFT JOIN cities c ON c.id = h.city_id
      LEFT JOIN (SELECT hotel_id, MIN(base_price) as min_price FROM hotel_rooms WHERE status = 'active' GROUP BY hotel_id) rp ON rp.hotel_id = h.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY h.rating_average DESC`,
      params,
    );

    const mapped = rows.map((r: Record<string, unknown>) => ({
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
      featured: r.featured ?? false,
      check_in_time: r.check_in_time,
      check_out_time: r.check_out_time,
      created_at: r.created_at,
      updated_at: r.updated_at,
      name: { uz: r.name, ru: r.name, en: r.name },
      description: {
        uz: r.description,
        ru: r.description,
        en: r.description,
      },
      city: { id: r.city_id, region_id: r.region_id, name: r.city_name },
      amenities: [],
      images: [],
      min_price: Number(r.min_price || 0),
    }));

    const pagination = parsePagination(query, 'public', {
      allowedSortBy: ['created_at', 'rating_average', 'stars', 'min_price'],
      defaultSortBy: 'rating_average',
    });

    return paginatedObject(mapped, pagination);
  }

  async findOne(slugOrId: string) {
    const rows = await this.pg.query(
      `SELECT h.id::text, h.partner_organization_id::text, h.slug, h.city_id::text,
        h.address, h.latitude::float8, h.longitude::float8, h.stars,
        h.rating_average::float8, h.reviews_count, h.status::text,
        h.check_in_time, h.check_out_time,
        h.created_at, h.updated_at,
        ht.name, ht.description,
        c.name as city_name, c.region_id::text
      FROM hotels h
      JOIN partner_organizations po ON po.id = h.partner_organization_id
      LEFT JOIN hotel_translations ht ON ht.hotel_id = h.id AND ht.language = 'uz'
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE (h.id::text = $1 OR h.slug = $1)
        AND h.status = 'published'
        AND h.deleted_at IS NULL
        AND po.status = 'approved'`,
      [slugOrId],
    );

    if (rows.length === 0) {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }

    const h = rows[0] as Record<string, unknown>;
    const roomRows = await this.pg.query(
      `SELECT hr.id::text, hr.hotel_id::text, hr.room_type_id::text, hr.code,
        hr.base_occupancy, hr.max_adults, hr.max_children,
        hr.total_inventory, hr.base_price::float8, hr.status::text
      FROM hotel_rooms hr
      WHERE hr.hotel_id = $1 AND hr.status = 'active'`,
      [h.id],
    );
    const rooms = roomRows.map((r: Record<string, unknown>) => ({
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
      description: {
        uz: h.description,
        ru: h.description,
        en: h.description,
      },
      city: { id: h.city_id, region_id: h.region_id, name: h.city_name },
      amenities: [],
      images: [],
      rooms,
    };
  }

  async rooms(id: string) {
    const rows = await this.pg.query(
      `SELECT hr.id::text, hr.hotel_id::text, hr.room_type_id::text, hr.code,
        hr.base_occupancy, hr.max_adults, hr.max_children,
        hr.total_inventory, hr.base_price::float8, hr.status::text
      FROM hotel_rooms hr
      WHERE hr.hotel_id = $1 AND hr.status = 'active'`,
      [id],
    );

    return rows.map((r: Record<string, unknown>) => ({
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
      quote_id: `quote-${Date.now()}`,
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
    return this.pg.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.target_type = 'hotel' AND r.target_id = $1 AND r.status = 'published'
       ORDER BY r.created_at DESC`,
      [id],
    );
  }

  async map(query: QueryLike) {
    const hotels = (await this.findAll(query)) as {
      items: Array<Record<string, unknown>>;
    };
    return hotels.items.map((hotel) => ({
      id: hotel['id'],
      slug: hotel['slug'],
      name: hotel['name'],
      latitude: hotel['latitude'],
      longitude: hotel['longitude'],
      rating_average: hotel['rating_average'],
      min_price: hotel['min_price'],
    }));
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

function cacheKey(query: QueryLike): string {
  return Object.keys(query)
    .sort()
    .map(
      (key) => `${key}=${encodeURIComponent(String(first(query[key]) ?? ''))}`,
    )
    .join('&');
}
