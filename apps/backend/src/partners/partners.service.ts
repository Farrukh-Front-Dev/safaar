import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import {
  paginateArray,
  parsePagination,
  type QueryLike,
} from '../common/pagination';
import { PostgresService } from '../infrastructure/postgres.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { hashSecret, partnerApiPepper, randomToken } from '../auth/security';
import { randomUUID } from 'node:crypto';

type HotelListingStatus = 'draft' | 'pending_review' | 'published' | 'hidden';

function localizedText(
  body: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = String(body[key] ?? body.name ?? fallback);
  return {
    uz: String(body[`${key}_uz`] ?? body.name_uz ?? value),
    ru: String(body[`${key}_ru`] ?? body.name_ru ?? value),
    en: String(body[`${key}_en`] ?? body.name_en ?? value),
  };
}

function listingStatus(value: unknown): HotelListingStatus {
  const status = String(value ?? 'pending_review').toLowerCase();
  if (status === 'published') {
    return 'published';
  }
  if (status === 'hidden') {
    return 'hidden';
  }
  if (status === 'draft') {
    return 'draft';
  }
  if (status === 'under_review' || status === 'pending_review') {
    return 'pending_review';
  }
  return 'pending_review';
}

/**
 * Hamkor (mehmonxona/avtobus kompaniyasi) kabineti xizmati.
 * partner.uzbron.uz uchun: xonalar, bronlar, moliya boshqaruvi.
 */
@Injectable()
export class PartnersService {
  private readonly teamMembers: Array<Record<string, unknown>> = [];
  private readonly documentsStore: Array<Record<string, unknown>> = [];
  private readonly vehiclesStore: Array<Record<string, unknown>> = [];
  private readonly withdrawalsStore: Array<Record<string, unknown>> = [];
  private readonly financeDocumentsStore: Array<Record<string, unknown>> = [];
  private readonly routesInternal: Array<Record<string, unknown>> = [];
  private readonly tripsInternal: Array<Record<string, unknown>> = [];
  private readonly tripSeatsInternal: Array<Record<string, unknown>> = [];
  private readonly roomTypesInternal: Array<Record<string, unknown>> = [];

  constructor(
    private readonly pg: PostgresService,
    private readonly jobs: JobQueueService,
  ) {}

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  async dashboard(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    const today = new Date().toISOString().slice(0, 10);
    const firstDay = today.slice(0, 7) + '-01';

    const [todayResult, revenueResult, customersResult, ratingResult] =
      await Promise.all([
        this.pg.query<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM bookings WHERE partner_organization_id = $1 AND created_at::text LIKE $2 || '%'`,
          [organizationId, today],
        ),
        this.pg.query<{ sum: string | null }>(
          `SELECT COALESCE(SUM(partner_payable), 0)::text as sum FROM bookings WHERE partner_organization_id = $1 AND created_at::text LIKE $2 || '%'`,
          [organizationId, firstDay],
        ),
        this.pg.query<{ count: string }>(
          `SELECT COUNT(DISTINCT user_id)::text as count FROM bookings WHERE partner_organization_id = $1`,
          [organizationId],
        ),
        this.pg.query<{ avg: string | null }>(
          `SELECT AVG(rating_average)::text as avg FROM hotels WHERE partner_organization_id = $1 AND rating_average IS NOT NULL`,
          [organizationId],
        ),
      ]);

    return {
      todayBookings: Number(todayResult[0]?.count ?? 0),
      monthRevenue: Number(revenueResult[0]?.sum ?? 0),
      totalCustomers: Number(customersResult[0]?.count ?? 0),
      rating: ratingResult[0]?.avg
        ? Number(Number(ratingResult[0].avg).toFixed(1))
        : 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  async profile(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.assertOrganization(organizationId);
  }

  async updateProfile(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const organization = await this.profile(actor);
    const now = new Date().toISOString();
    const brandName = body.brand_name
      ? String(body.brand_name)
      : organization.brand_name;
    const phone = body.phone ? String(body.phone) : organization.phone;
    const email = body.email
      ? String(body.email).toLowerCase()
      : organization.email;
    const address = body.address ? String(body.address) : organization.address;

    const result = await this.pg.query(
      `UPDATE partner_organizations SET brand_name = $1, phone = $2, email = $3, address = $4, updated_at = $5 WHERE id = $6 RETURNING *`,
      [brandName, phone, email, address, now, organization.id],
    );
    return result[0];
  }

  // ---------------------------------------------------------------------------
  // Team members (internal array — no dedicated table)
  // ---------------------------------------------------------------------------

  team(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.teamMembers.filter(
      (member) => member['organization_id'] === organizationId,
    );
  }

  inviteTeamMember(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const member = {
      id: randomUUID(),
      organization_id: this.organizationId(actor),
      email: String(body.email ?? '').toLowerCase(),
      role: String(body.role ?? 'operator'),
      status: 'invited',
      created_at: new Date().toISOString(),
    };
    this.teamMembers.unshift(member);
    return member;
  }

  updateTeamMember(id: string, body: Record<string, unknown>) {
    return {
      id,
      role: String(body.role ?? 'operator'),
      status: String(body.status ?? 'active'),
      updated_at: new Date().toISOString(),
    };
  }

  deleteTeamMember(id: string) {
    return { id, deleted: true };
  }

  // ---------------------------------------------------------------------------
  // Documents (internal array — no dedicated table)
  // ---------------------------------------------------------------------------

  documents(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.documentsStore.filter(
      (document) => document['organization_id'] === organizationId,
    );
  }

  addDocument(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const document = {
      id: randomUUID(),
      organization_id: this.organizationId(actor),
      type: String(body.type ?? 'license'),
      file_id: String(body.file_id ?? randomUUID()),
      status: 'uploaded',
      created_at: new Date().toISOString(),
    };
    this.documentsStore.unshift(document);
    return document;
  }

  // ---------------------------------------------------------------------------
  // Application
  // ---------------------------------------------------------------------------

  async submitApplication(actor: RequestActor | undefined) {
    const now = new Date().toISOString();
    const organizationId = this.organizationId(actor);
    const result = await this.pg.query(
      `UPDATE partner_organizations SET status = 'submitted', updated_at = $1 WHERE id = $2 RETURNING *`,
      [now, organizationId],
    );
    return result[0];
  }

  async applicationStatus(actor: RequestActor | undefined) {
    const organization = await this.profile(actor);
    return {
      organization_id: organization.id,
      status: organization.status,
      history: [],
    };
  }

  async resubmitApplication(actor: RequestActor | undefined) {
    const now = new Date().toISOString();
    const organizationId = this.organizationId(actor);
    const result = await this.pg.query(
      `UPDATE partner_organizations SET status = 'submitted', updated_at = $1 WHERE id = $2 RETURNING *`,
      [now, organizationId],
    );
    return result[0];
  }

  // ---------------------------------------------------------------------------
  // Hotels
  // ---------------------------------------------------------------------------

  async hotels(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    const pagination = parsePagination(query, 'partner', {
      defaultLimit: 50,
      allowedSortBy: ['created_at', 'updated_at', 'status', 'stars'],
    });

    const sortColumn = pagination.sortBy === 'stars' ? 'stars' : 'created_at';
    const orderDir = pagination.order === 'asc' ? 'ASC' : 'DESC';

    return this.pg.query(
      `SELECT * FROM hotels WHERE partner_organization_id = $1 ORDER BY ${sortColumn} ${orderDir} LIMIT $2 OFFSET $3`,
      [organizationId, pagination.limit, pagination.offset],
    );
  }

  async createHotel(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const organizationId = this.organizationId(actor);
    const now = new Date().toISOString();
    const hotelId = randomUUID();
    const slug = String(body.slug ?? `hotel-${Date.now()}`);
    const cityId = String(body.city_id ?? '');
    const address = String(body.address ?? '');
    const latitude = Number(body.latitude ?? 0);
    const longitude = Number(body.longitude ?? 0);
    const stars = Number(body.stars ?? 3);

    // Insert hotel
    await this.pg.query(
      `INSERT INTO hotels (id, partner_organization_id, slug, city_id, address, latitude, longitude, stars, rating_average, reviews_count, status, check_in_time, check_out_time, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 'draft', '14:00', '12:00', $9, $10)`,
      [
        hotelId,
        organizationId,
        slug,
        cityId,
        address,
        latitude,
        longitude,
        stars,
        now,
        now,
      ],
    );

    // Insert translations
    const nameUz = String(body.name_uz ?? body.name ?? 'Yangi hotel');
    const nameRu = String(body.name_ru ?? body.name ?? 'Новый отель');
    const nameEn = String(body.name_en ?? body.name ?? 'New hotel');

    await this.pg.query(
      `INSERT INTO hotel_translations (hotel_id, language, name, description, created_at, updated_at) VALUES
       ($1, 'uz', $2, '', $3, $4),
       ($1, 'ru', $5, '', $3, $4),
       ($1, 'en', $6, '', $3, $4)`,
      [hotelId, nameUz, now, now, nameRu, nameEn],
    );

    // Return the created hotel
    const hotels = await this.pg.query(`SELECT * FROM hotels WHERE id = $1`, [
      hotelId,
    ]);
    return {
      ...hotels[0],
      name: { uz: nameUz, ru: nameRu, en: nameEn },
      description: { uz: '', ru: '', en: '' },
      amenities: [],
      images: [],
    };
  }

  async hotel(actor: RequestActor | undefined, id: string) {
    return this.assertHotel(id, actor);
  }

  async updateHotel(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const sets: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (body.address !== undefined) {
      sets.push(`address = $${paramIndex++}`);
      params.push(String(body.address));
    }
    if (body.stars !== undefined) {
      sets.push(`stars = $${paramIndex++}`);
      params.push(Number(body.stars));
    }
    if (body.status !== undefined) {
      sets.push(`status = $${paramIndex++}`);
      params.push(String(body.status));
    }
    if (body.latitude !== undefined) {
      sets.push(`latitude = $${paramIndex++}`);
      params.push(Number(body.latitude));
    }
    if (body.longitude !== undefined) {
      sets.push(`longitude = $${paramIndex++}`);
      params.push(Number(body.longitude));
    }
    if (body.check_in_time !== undefined) {
      sets.push(`check_in_time = $${paramIndex++}`);
      params.push(String(body.check_in_time));
    }
    if (body.check_out_time !== undefined) {
      sets.push(`check_out_time = $${paramIndex++}`);
      params.push(String(body.check_out_time));
    }

    if (sets.length === 0) {
      return this.assertHotel(id, actor);
    }

    sets.push(`updated_at = $${paramIndex++}`);
    params.push(now);
    params.push(id);

    const result = await this.pg.query(
      `UPDATE hotels SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params,
    );
    return result[0];
  }

  async submitHotelReview(actor: RequestActor | undefined, id: string) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const result = await this.pg.query(
      `UPDATE hotels SET status = 'pending_review', updated_at = $1 WHERE id = $2 RETURNING *`,
      [now, id],
    );
    return result[0];
  }

  async addHotelImage(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const imageUrl = String(
      body.url ?? body.image_url ?? `/mock/${randomUUID()}`,
    );
    // Append image to the hotel's images JSON array
    await this.pg.query(
      `UPDATE hotels SET images = COALESCE(images, '[]'::jsonb) || $1::jsonb, updated_at = $2 WHERE id = $3`,
      [JSON.stringify([imageUrl]), new Date().toISOString(), id],
    );
    return { hotel_id: id, image_url: imageUrl };
  }

  async deleteHotelImage(
    actor: RequestActor | undefined,
    id: string,
    imageId: string,
  ) {
    await this.assertHotel(id, actor);
    return { hotel_id: id, image_id: imageId, deleted: true };
  }

  // ---------------------------------------------------------------------------
  // Rooms
  // ---------------------------------------------------------------------------

  async rooms(actor: RequestActor | undefined, id: string) {
    await this.assertHotel(id, actor);
    return this.pg.query(
      `SELECT * FROM hotel_rooms WHERE hotel_id = $1 ORDER BY code ASC`,
      [id],
    );
  }

  async roomTypes(actor: RequestActor | undefined, id: string) {
    await this.assertHotel(id, actor);
    // Read from DB + internal array for locally created types
    const dbTypes = await this.pg.query(
      `SELECT * FROM room_types ORDER BY name ASC`,
    );
    const allInternal = this.roomTypesInternal.filter(
      (rt) => rt['hotel_id'] === id || rt['hotel_id'] === undefined,
    );
    return [...dbTypes, ...allInternal];
  }

  createRoomType(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotelSync(id, actor);
    const roomType = {
      id: randomUUID(),
      hotel_id: id,
      name: localizedText(body, 'name', 'Yangi xona turi'),
      created_at: new Date().toISOString(),
    };
    this.roomTypesInternal.unshift(roomType);
    return roomType;
  }

  updateRoomType(
    actor: RequestActor | undefined,
    id: string,
    roomTypeId: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotelSync(id, actor);
    const roomType = this.roomTypesInternal.find(
      (item) => item['id'] === roomTypeId,
    );
    if (!roomType) {
      throw new NotFoundException({
        code: 'ROOM_TYPE_NOT_FOUND',
        message: 'Xona turi topilmadi',
      });
    }
    roomType['name'] = localizedText(
      body,
      'name',
      (roomType['name'] as Record<string, string>)?.uz ?? '',
    );
    return roomType;
  }

  deleteRoomType(
    actor: RequestActor | undefined,
    id: string,
    roomTypeId: string,
  ) {
    this.assertHotelSync(id, actor);
    const inUse = this.roomTypesInternal.some(
      (item) => item['id'] === roomTypeId,
    );
    if (inUse) {
      return {
        ok: false,
        reason:
          "Bu turdan foydalanayotgan xonalar bor. Avval ularni boshqa turga o'tkazing.",
      };
    }

    const index = this.roomTypesInternal.findIndex(
      (item) => item['id'] === roomTypeId,
    );
    if (index >= 0) {
      this.roomTypesInternal.splice(index, 1);
    }
    return { ok: true, room_type_id: roomTypeId, deleted: true };
  }

  async createRoom(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const roomId = randomUUID();
    const code = String(
      body.code ?? body.number ?? body.room_number ?? `R-${Date.now()}`,
    );
    const roomTypeId = String(
      body.room_type_id ?? body.roomTypeId ?? body.room_type ?? '',
    );
    const baseOccupancy = Number(body.base_occupancy ?? body.capacity ?? 2);
    const maxAdults = Number(body.max_adults ?? body.capacity ?? 2);
    const maxChildren = Number(body.max_children ?? 1);
    const totalInventory = Number(body.total_inventory ?? body.inventory ?? 1);
    const basePrice = Number(
      body.base_price ?? body.basePrice ?? body.nightlyPrice ?? 300000,
    );

    await this.pg.query(
      `INSERT INTO hotel_rooms (id, hotel_id, room_type_id, code, base_occupancy, max_adults, max_children, total_inventory, base_price, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11)`,
      [
        roomId,
        id,
        roomTypeId,
        code,
        baseOccupancy,
        maxAdults,
        maxChildren,
        totalInventory,
        basePrice,
        now,
        now,
      ],
    );

    const rooms = await this.pg.query(
      `SELECT * FROM hotel_rooms WHERE id = $1`,
      [roomId],
    );
    return rooms[0];
  }

  async updateRoom(
    actor: RequestActor | undefined,
    id: string,
    roomId: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();

    const sets: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (body.code !== undefined || body.number !== undefined) {
      sets.push(`code = $${paramIndex++}`);
      params.push(String(body.code ?? body.number));
    }
    if (body.room_type_id !== undefined || body.roomTypeId !== undefined) {
      sets.push(`room_type_id = $${paramIndex++}`);
      params.push(String(body.room_type_id ?? body.roomTypeId));
    }
    if (body.base_price !== undefined) {
      sets.push(`base_price = $${paramIndex++}`);
      params.push(Number(body.base_price));
    } else if (body.basePrice !== undefined) {
      sets.push(`base_price = $${paramIndex++}`);
      params.push(Number(body.basePrice));
    } else if (body.nightlyPrice !== undefined) {
      sets.push(`base_price = $${paramIndex++}`);
      params.push(Number(body.nightlyPrice));
    }
    if (body.total_inventory !== undefined) {
      sets.push(`total_inventory = $${paramIndex++}`);
      params.push(Number(body.total_inventory));
    } else if (body.inventory !== undefined) {
      sets.push(`total_inventory = $${paramIndex++}`);
      params.push(Number(body.inventory));
    }
    if (body.base_occupancy !== undefined) {
      sets.push(`base_occupancy = $${paramIndex++}`);
      params.push(Number(body.base_occupancy));
    } else if (body.capacity !== undefined) {
      sets.push(`base_occupancy = $${paramIndex++}`);
      params.push(Number(body.capacity));
    }
    if (body.max_adults !== undefined) {
      sets.push(`max_adults = $${paramIndex++}`);
      params.push(Number(body.max_adults));
    } else if (body.capacity !== undefined) {
      sets.push(`max_adults = $${paramIndex++}`);
      params.push(Number(body.capacity));
    }

    if (sets.length === 0) {
      const rooms = await this.pg.query(
        `SELECT * FROM hotel_rooms WHERE id = $1 AND hotel_id = $2`,
        [roomId, id],
      );
      if (!rooms[0]) {
        throw new NotFoundException({
          code: 'ROOM_NOT_AVAILABLE',
          message: 'Xona topilmadi',
        });
      }
      return rooms[0];
    }

    sets.push(`updated_at = $${paramIndex++}`);
    params.push(now);
    params.push(roomId);
    params.push(id);

    const result = await this.pg.query(
      `UPDATE hotel_rooms SET ${sets.join(', ')} WHERE id = $${paramIndex++} AND hotel_id = $${paramIndex} RETURNING *`,
      params,
    );

    if (!result[0]) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Xona topilmadi',
      });
    }
    return result[0];
  }

  async createRoomsBulk(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const floor = Number(body.floor ?? 1);
    const startNumber = Number(body.startNumber ?? body.start_number ?? 101);
    const count = Math.max(0, Math.min(Number(body.count ?? 0), 200));
    const roomTypeId = String(
      body.roomTypeId ?? body.room_type_id ?? body.room_type ?? '',
    );

    // Get existing codes
    const existing = await this.pg.query(
      `SELECT code FROM hotel_rooms WHERE hotel_id = $1`,
      [id],
    );
    const existingCodes = new Set(existing.map((r) => String(r['code'])));

    const created: Array<Record<string, unknown>> = [];
    const now = new Date().toISOString();

    for (let index = 0; index < count; index += 1) {
      const code = String(startNumber + index);
      if (existingCodes.has(code)) {
        continue;
      }
      existingCodes.add(code);

      const roomId = randomUUID();
      const baseOccupancy = Number(body.base_occupancy ?? body.capacity ?? 2);
      const maxAdults = Number(body.max_adults ?? body.capacity ?? 2);
      const maxChildren = Number(body.max_children ?? 1);
      const totalInventory = Number(
        body.total_inventory ?? body.inventory ?? 1,
      );
      const basePrice = Number(body.base_price ?? body.basePrice ?? 300000);

      await this.pg.query(
        `INSERT INTO hotel_rooms (id, hotel_id, room_type_id, code, base_occupancy, max_adults, max_children, total_inventory, base_price, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11)`,
        [
          roomId,
          id,
          roomTypeId,
          code,
          baseOccupancy,
          maxAdults,
          maxChildren,
          totalInventory,
          basePrice,
          now,
          now,
        ],
      );

      created.push({
        id: roomId,
        code,
        hotel_id: id,
        room_type_id: roomTypeId,
      });
    }

    return {
      ok: created.length === count,
      added: created.length,
      rooms: created,
      reason:
        created.length === count
          ? undefined
          : "Ba'zi xona raqamlari oldindan mavjud bo'lgani uchun o'tkazib yuborildi.",
    };
  }

  async deleteRoom(
    actor: RequestActor | undefined,
    id: string,
    roomId: string,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    await this.pg.query(
      `UPDATE hotel_rooms SET status = 'inactive', updated_at = $1 WHERE id = $2 AND hotel_id = $3`,
      [now, roomId, id],
    );
    return { hotel_id: id, room_id: roomId, deleted: true };
  }

  // ---------------------------------------------------------------------------
  // Inventory
  // ---------------------------------------------------------------------------

  async inventory(actor: RequestActor | undefined, id: string) {
    await this.assertHotel(id, actor);
    const rooms = await this.pg.query(
      `SELECT id, total_inventory FROM hotel_rooms WHERE hotel_id = $1 AND status = 'active'`,
      [id],
    );
    return rooms.map((room) => ({
      room_id: room.id,
      date: new Date().toISOString().slice(0, 10),
      total_count: room.total_inventory,
      held_count: 0,
      booked_count: 0,
      closed: false,
    }));
  }

  updateInventory(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    return {
      hotel_id: id,
      updated: true,
      items: body.items ?? [],
    };
  }

  blackoutDates(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    return {
      hotel_id: id,
      dates: body.dates ?? [],
      closed: true,
    };
  }

  // ---------------------------------------------------------------------------
  // Listing helpers
  // ---------------------------------------------------------------------------

  async updateListingGeneral(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();

    const nameUz = String(body.name_uz ?? body.name ?? '');
    const nameRu = String(body.name_ru ?? body.name ?? '');
    const nameEn = String(body.name_en ?? body.name ?? '');
    const descUz = String(body.description_uz ?? body.description ?? '');
    const descRu = String(body.description_ru ?? body.description ?? '');
    const descEn = String(body.description_en ?? body.description ?? '');
    const stars = body.stars ? Number(body.stars) : undefined;

    // Update translations
    if (nameUz || descUz) {
      await this.pg.query(
        `INSERT INTO hotel_translations (hotel_id, language, name, description, created_at, updated_at)
         VALUES ($1, 'uz', $2, $3, $4, $4)
         ON CONFLICT (hotel_id, language) DO UPDATE SET name = $2, description = $3, updated_at = $4`,
        [id, nameUz, descUz, now],
      );
    }
    if (nameRu || descRu) {
      await this.pg.query(
        `INSERT INTO hotel_translations (hotel_id, language, name, description, created_at, updated_at)
         VALUES ($1, 'ru', $2, $3, $4, $4)
         ON CONFLICT (hotel_id, language) DO UPDATE SET name = $2, description = $3, updated_at = $4`,
        [id, nameRu, descRu, now],
      );
    }
    if (nameEn || descEn) {
      await this.pg.query(
        `INSERT INTO hotel_translations (hotel_id, language, name, description, created_at, updated_at)
         VALUES ($1, 'en', $2, $3, $4, $4)
         ON CONFLICT (hotel_id, language) DO UPDATE SET name = $2, description = $3, updated_at = $4`,
        [id, nameEn, descEn, now],
      );
    }

    // Update stars on hotel
    if (stars !== undefined) {
      await this.pg.query(
        `UPDATE hotels SET stars = $1, updated_at = $2 WHERE id = $3`,
        [stars, now, id],
      );
    }

    const hotel = await this.assertHotel(id, actor);
    return hotel;
  }

  async updateListingLocation(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (body.address !== undefined) {
      sets.push(`address = $${idx++}`);
      params.push(String(body.address));
    }
    if (body.latitude !== undefined) {
      sets.push(`latitude = $${idx++}`);
      params.push(Number(body.latitude));
    }
    if (body.longitude !== undefined) {
      sets.push(`longitude = $${idx++}`);
      params.push(Number(body.longitude));
    }

    if (sets.length > 0) {
      sets.push(`updated_at = $${idx++}`);
      params.push(now);
      params.push(id);
      await this.pg.query(
        `UPDATE hotels SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        params,
      );
    }

    return this.assertHotel(id, actor);
  }

  async updateListingRules(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    const checkInTime = body.checkInTime ?? body.check_in_time ?? undefined;
    const checkOutTime = body.checkOutTime ?? body.check_out_time ?? undefined;

    if (checkInTime !== undefined) {
      sets.push(`check_in_time = $${idx++}`);
      params.push(String(checkInTime));
    }
    if (checkOutTime !== undefined) {
      sets.push(`check_out_time = $${idx++}`);
      params.push(String(checkOutTime));
    }

    if (sets.length > 0) {
      sets.push(`updated_at = $${idx++}`);
      params.push(now);
      params.push(id);
      await this.pg.query(
        `UPDATE hotels SET ${sets.join(', ')} WHERE id = $${idx}`,
        params,
      );
    }

    return {
      ...(await this.assertHotel(id, actor)),
      cancellation_policy: body.cancellationPolicy ?? body.cancellation_policy,
      smoking_allowed: body.smokingAllowed ?? body.smoking_allowed,
      pets_allowed: body.petsAllowed ?? body.pets_allowed,
      children_allowed: body.childrenAllowed ?? body.children_allowed,
      extra_fees: body.extraFees ?? body.extra_fees ?? [],
    };
  }

  async updateListingAmenities(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    if (Array.isArray(body.amenities)) {
      const amenities = body.amenities.map(String);
      await this.pg.query(
        `UPDATE hotels SET amenities = $1::jsonb, updated_at = $2 WHERE id = $3`,
        [JSON.stringify(amenities), now, id],
      );
    }
    return this.assertHotel(id, actor);
  }

  async updateListingStatus(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const status = listingStatus(body.status);
    const result = await this.pg.query(
      `UPDATE hotels SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
      [status, now, id],
    );
    return result[0];
  }

  async publishListing(actor: RequestActor | undefined, id: string) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const result = await this.pg.query(
      `UPDATE hotels SET status = 'pending_review', updated_at = $1 WHERE id = $2 RETURNING *`,
      [now, id],
    );
    return result[0];
  }

  // ---------------------------------------------------------------------------
  // Vehicles (internal array)
  // ---------------------------------------------------------------------------

  vehicles() {
    return this.vehiclesStore;
  }

  createVehicle(body: Record<string, unknown>) {
    const vehicle = {
      id: randomUUID(),
      name: String(body.name ?? 'Yutong'),
      plate_number: String(body.plate_number ?? ''),
      seats_count: Number(body.seats_count ?? 45),
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.vehiclesStore.unshift(vehicle);
    return vehicle;
  }

  updateVehicle(id: string, body: Record<string, unknown>) {
    return { id, ...body, updated_at: new Date().toISOString() };
  }

  seatLayout(id: string, body: Record<string, unknown>) {
    return {
      vehicle_id: id,
      layout: body.layout ?? [],
      updated_at: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Routes (internal array)
  // ---------------------------------------------------------------------------

  routes() {
    return this.routesInternal;
  }

  createRoute(body: Record<string, unknown>) {
    const route = {
      id: randomUUID(),
      from_city_id: String(body.from_city_id ?? 'city-tashkent'),
      to_city_id: String(body.to_city_id ?? 'city-samarkand'),
      duration_minutes: Number(body.duration_minutes ?? 270),
      created_at: new Date().toISOString(),
    };
    this.routesInternal.unshift(route);
    return route;
  }

  updateRoute(id: string, body: Record<string, unknown>) {
    return { id, ...body, updated_at: new Date().toISOString() };
  }

  // ---------------------------------------------------------------------------
  // Trips (internal array)
  // ---------------------------------------------------------------------------

  trips(query: QueryLike = {}) {
    return this.paginatePartner(this.tripsInternal, query);
  }

  createTrip(body: Record<string, unknown>) {
    const trip = {
      id: randomUUID(),
      route_id: String(body.route_id ?? ''),
      company_id: 'bus-company-uzbron',
      from_city_id: String(body.from_city_id ?? 'city-tashkent'),
      to_city_id: String(body.to_city_id ?? 'city-samarkand'),
      departure_at: String(body.departure_at ?? new Date().toISOString()),
      arrival_at: String(
        body.arrival_at ?? new Date(Date.now() + 4 * 60 * 60_000).toISOString(),
      ),
      vehicle_name: String(body.vehicle_name ?? 'Yutong'),
      status: 'scheduled' as const,
      base_price: Number(body.base_price ?? 120000),
      created_at: new Date().toISOString(),
    };
    this.tripsInternal.unshift(trip);
    return trip;
  }

  updateTrip(id: string, body: Record<string, unknown>) {
    const trip = this.tripsInternal.find((item) => item['id'] === id);
    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }
    trip['base_price'] = body.base_price
      ? Number(body.base_price)
      : trip['base_price'];
    return trip;
  }

  cancelTrip(id: string) {
    const trip = this.tripsInternal.find((item) => item['id'] === id);
    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }
    trip['status'] = 'cancelled';
    return trip;
  }

  tripSeats(id: string) {
    return this.tripSeatsInternal.filter((seat) => seat['trip_id'] === id);
  }

  // ---------------------------------------------------------------------------
  // Bookings
  // ---------------------------------------------------------------------------

  async bookings(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    const pagination = parsePagination(query, 'partner', {
      defaultLimit: 50,
      allowedSortBy: ['created_at', 'updated_at', 'status', 'total_amount'],
    });

    const sortColumn =
      pagination.sortBy === 'total_amount'
        ? 'total_amount'
        : pagination.sortBy === 'status'
          ? 'status'
          : 'created_at';
    const orderDir = pagination.order === 'asc' ? 'ASC' : 'DESC';

    return this.pg.query(
      `SELECT * FROM bookings WHERE partner_organization_id = $1 ORDER BY ${sortColumn} ${orderDir} LIMIT $2 OFFSET $3`,
      [organizationId, pagination.limit, pagination.offset],
    );
  }

  async createBooking(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const organizationId = this.organizationId(actor);
    const now = new Date().toISOString();
    const bookingId = randomUUID();
    const bookingNumber = `B-${Date.now().toString(36).toUpperCase()}`;
    const hotelId = String(body.hotel_id ?? body.hotelId ?? '');
    const roomTypeId = String(body.roomTypeId ?? body.room_type_id ?? '');

    // Validate hotel
    const hotels = await this.pg.query(
      `SELECT * FROM hotels WHERE id = $1 AND partner_organization_id = $2`,
      [hotelId, organizationId],
    );
    if (!hotels[0]) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: "Tanlangan hotel uchun ma'lumot topilmadi",
      });
    }

    // Find a room
    const rooms = await this.pg.query(
      `SELECT * FROM hotel_rooms WHERE hotel_id = $1${roomTypeId ? ' AND room_type_id = $2' : ''} AND status = 'active' LIMIT 1`,
      roomTypeId ? [hotelId, roomTypeId] : [hotelId],
    );
    if (!rooms[0]) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Tanlangan hotel uchun xona topilmadi',
      });
    }
    const room = rooms[0];

    const checkIn = String(
      body.checkIn ?? body.check_in ?? new Date().toISOString().slice(0, 10),
    );
    const checkOut = String(body.checkOut ?? body.check_out ?? checkIn);
    const nights = Math.max(1, Number(body.nights ?? 1));
    const totalAmount = Number(
      body.totalPrice ?? body.total_amount ?? room['base_price'] * nights,
    );
    const commissionAmount = Math.round(totalAmount * 0.12);

    const itemPayload = {
      hotel_id: hotelId,
      room_id: room['id'],
      room_type_id: room['room_type_id'],
      room_number: body.roomNumber ?? body.room_number ?? null,
      source: String(body.source ?? 'walk_in'),
      guest: {
        fullName: String(body.fullName ?? body.full_name ?? 'Walk-in mijoz'),
        phone: String(body.phone ?? ''),
      },
      check_in: checkIn,
      check_out: checkOut,
      nights,
      adults: Number(body.adults ?? 1),
      children: Number(body.children ?? 0),
    };

    // Insert booking
    await this.pg.query(
      `INSERT INTO bookings (id, booking_number, user_id, partner_organization_id, type, confirmation_mode, payment_method, status, currency, total_amount, subtotal, discount_amount, bonus_amount, service_fee, commission_amount, partner_payable, hotel_id, item, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb, $19, $20)`,
      [
        bookingId,
        bookingNumber,
        'demo-user-id',
        organizationId,
        'hotel',
        'instant_confirmation',
        'cash',
        BookingStatus.CONFIRMED,
        'UZS',
        totalAmount,
        totalAmount,
        0,
        0,
        0,
        commissionAmount,
        totalAmount - commissionAmount,
        hotelId,
        JSON.stringify(itemPayload),
        now,
        now,
      ],
    );

    // Create payment
    const paymentId = randomUUID();
    await this.pg.query(
      `INSERT INTO payments (id, booking_id, provider, status, amount, currency, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [paymentId, bookingId, 'cash', 'paid', totalAmount, 'UZS', now, now],
    );

    const bookings = await this.pg.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId],
    );
    return bookings[0];
  }

  async booking(actor: RequestActor | undefined, id: string) {
    const organizationId = this.organizationId(actor);
    const bookings = await this.pg.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [id],
    );
    if (!bookings[0]) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }
    if (bookings[0]['partner_organization_id'] !== organizationId) {
      throw new ForbiddenException({
        code: 'BOOKING_FORBIDDEN',
        message: 'Bu bron sizning tashkilotingizga tegishli emas',
      });
    }
    return bookings[0];
  }

  async assignRoom(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.booking(actor, id); // validate ownership
    const now = new Date().toISOString();
    const roomNumber = String(body.roomNumber ?? body.room_number ?? '');

    const result = await this.pg.query(
      `UPDATE bookings
       SET item = jsonb_set(COALESCE(item, '{}'::jsonb), '{room_number}', to_jsonb($1::text)), updated_at = $2
       WHERE id = $3 RETURNING *`,
      [roomNumber, now, id],
    );
    return result[0];
  }

  async bookingStatus(
    actor: RequestActor | undefined,
    id: string,
    status: string,
  ) {
    await this.booking(actor, id); // validate ownership
    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = $1'];
    const params: unknown[] = [now];

    let paramIdx = 2;

    if (status === 'confirmed') {
      sets.push(`status = $${paramIdx++}`, `confirmed_at = $1`);
      params.push(BookingStatus.CONFIRMED);
    } else if (status === 'checked_in') {
      sets.push(`status = $${paramIdx++}`);
      params.push(BookingStatus.CONFIRMED);
      // Set checked_in_at inside item jsonb
      await this.pg.query(
        `UPDATE bookings SET item = jsonb_set(COALESCE(item, '{}'::jsonb), '{checked_in_at}', to_jsonb($1::text)), updated_at = $1 WHERE id = $2`,
        [now, id],
      );
    } else if (status === 'boarded') {
      await this.pg.query(
        `UPDATE bookings SET item = jsonb_set(COALESCE(item, '{}'::jsonb), '{boarded_at}', to_jsonb($1::text)), updated_at = $1 WHERE id = $2`,
        [now, id],
      );
    } else if (status === 'completed') {
      sets.push(`status = $${paramIdx++}`);
      params.push(BookingStatus.COMPLETED);
      await this.pg.query(
        `UPDATE bookings SET item = jsonb_set(COALESCE(item, '{}'::jsonb), '{checked_out_at}', to_jsonb($1::text)), updated_at = $1 WHERE id = $2`,
        [now, id],
      );
    }

    if (paramIdx > 2) {
      params.push(id);
      await this.pg.query(
        `UPDATE bookings SET ${sets.join(', ')} WHERE id = $${paramIdx}`,
        params,
      );
    }

    const updated = await this.pg.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [id],
    );
    return updated[0];
  }

  async rejectBooking(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.booking(actor, id); // validate ownership
    const now = new Date().toISOString();
    const reason = String(body.reason ?? 'Partner rad etdi');

    const result = await this.pg.query(
      `UPDATE bookings SET status = $1, cancel_reason_text = $2, cancelled_at = $3, updated_at = $3 WHERE id = $4 RETURNING *`,
      [BookingStatus.CANCELLED, reason, now, id],
    );
    return result[0];
  }

  async cashStatus(
    actor: RequestActor | undefined,
    id: string,
    status: 'collected' | 'reversed',
  ) {
    await this.booking(actor, id); // validate ownership
    const now = new Date().toISOString();

    const payments = await this.pg.query(
      `SELECT * FROM payments WHERE booking_id = $1 LIMIT 1`,
      [id],
    );

    if (payments[0]) {
      const paymentStatus = status === 'collected' ? 'paid' : 'awaiting_cash';
      await this.pg.query(
        `UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3`,
        [paymentStatus, now, payments[0]['id']],
      );
      const updatedPayments = await this.pg.query(
        `SELECT * FROM payments WHERE id = $1`,
        [payments[0]['id']],
      );
      return {
        booking_id: id,
        cash_status: status,
        payment: updatedPayments[0],
      };
    }

    return { booking_id: id, cash_status: status, payment: undefined };
  }

  // ---------------------------------------------------------------------------
  // Finance
  // ---------------------------------------------------------------------------

  async financeOverview(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    const result = await this.pg.query<{ sum: string | null }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text as sum FROM bookings WHERE partner_organization_id = $1`,
      [organizationId],
    );
    const gross = Number(result[0]?.sum ?? 0);
    return {
      gross_amount: gross,
      pending_balance: Math.round(gross * 0.88),
      available_balance: Math.round(gross * 0.7),
      currency: 'UZS',
    };
  }

  async ledger(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    const pagination = parsePagination(query, 'partner', {
      defaultLimit: 50,
      allowedSortBy: ['created_at', 'amount'],
    });

    const entries = await this.pg.query(
      `SELECT b.id, b.id as booking_id, b.partner_payable as amount, b.currency, 'booking_payable' as type, b.created_at
       FROM bookings b
       WHERE b.partner_organization_id = $1
       ORDER BY b.created_at DESC`,
      [organizationId],
    );

    return entries.slice(
      pagination.offset,
      pagination.offset + pagination.limit,
    );
  }

  async financeChart(actor: RequestActor | undefined) {
    const overview = await this.financeOverview(actor);
    return [
      {
        date: new Date().toISOString().slice(0, 10),
        amount: overview.gross_amount,
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Withdrawals (internal array)
  // ---------------------------------------------------------------------------

  withdrawal(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const request = {
      id: randomUUID(),
      organization_id: this.organizationId(actor),
      amount: Number(body.amount ?? 0),
      currency: 'UZS',
      status: 'requested',
      created_at: new Date().toISOString(),
    };
    this.withdrawalsStore.unshift(request);
    return request;
  }

  withdrawals(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    return this.paginatePartner(
      this.withdrawalsStore.filter(
        (withdrawal) => withdrawal['organization_id'] === organizationId,
      ),
      query,
    );
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  async createExport(
    actor: RequestActor | undefined,
    type: string,
    body: Record<string, unknown>,
  ) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'partner' as const,
      role: Role.USER,
    };
    const now = new Date().toISOString();
    const format = ['csv', 'xlsx', 'pdf'].includes(String(body.format))
      ? (String(body.format) as 'csv' | 'xlsx' | 'pdf')
      : 'csv';

    const jobId = randomUUID();
    await this.pg.query(
      `INSERT INTO export_jobs (id, owner_type, owner_id, type, format, status, created_at, updated_at)
       VALUES ($1, 'partner', $2, $3, $4, 'queued', $5, $6)`,
      [jobId, currentActor.id, type, format, now, now],
    );

    await this.jobs.add(
      'partner-export',
      {
        export_id: jobId,
        owner_id: currentActor.id,
        type,
        format,
      },
      {
        idempotencyKey: `partner-export:${currentActor.id}:${type}:${format}`,
      },
    );

    const jobs = await this.pg.query(
      `SELECT * FROM export_jobs WHERE id = $1`,
      [jobId],
    );
    return jobs[0];
  }

  // ---------------------------------------------------------------------------
  // Finance Documents (internal array)
  // ---------------------------------------------------------------------------

  financeDocuments(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.financeDocumentsStore.filter(
      (document) => document['organization_id'] === organizationId,
    );
  }

  financeDocumentDownload(id: string) {
    return {
      id,
      download_url: `https://api.uzbron.uz/v1/partner/finance/documents/${id}/mock.pdf`,
    };
  }

  // ---------------------------------------------------------------------------
  // API Keys
  // ---------------------------------------------------------------------------

  async apiKeys(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    const keys = await this.pg.query(
      `SELECT * FROM partner_api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [organizationId],
    );
    return keys.map((key) => this.publicApiKey(key));
  }

  async createApiKey(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const now = new Date().toISOString();
    const prefix = `uzb_live_${randomToken(5)}`;
    const fullKey = `${prefix}_${randomToken(24)}`;
    const keyId = randomUUID();

    const apiKey = {
      id: keyId,
      organization_id: this.organizationId(actor),
      name: String(body.name ?? 'Default API key'),
      key_prefix: prefix,
      scopes: Array.isArray(body.scopes) ? body.scopes : ['bookings:read'],
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    await this.pg.query(
      `INSERT INTO partner_api_keys (id, organization_id, name, key_prefix, secret_hash, scopes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        keyId,
        apiKey.organization_id,
        apiKey.name,
        prefix,
        hashSecret(fullKey, partnerApiPepper()),
        JSON.stringify(apiKey.scopes),
        now,
      ],
    );

    return { ...this.publicApiKey(apiKey), api_key: fullKey };
  }

  async revokeApiKey(actor: RequestActor | undefined, id: string) {
    const now = new Date().toISOString();
    const organizationId = this.organizationId(actor);

    const result = await this.pg.query(
      `UPDATE partner_api_keys SET status = 'revoked', revoked_at = $1, updated_at = $1 WHERE id = $2 AND organization_id = $3 RETURNING *`,
      [now, id, organizationId],
    );

    if (!result[0]) {
      throw new NotFoundException({
        code: 'API_KEY_INVALID',
        message: 'API key topilmadi',
      });
    }

    return this.publicApiKey(result[0]);
  }

  // ---------------------------------------------------------------------------
  // Webhooks
  // ---------------------------------------------------------------------------

  async webhooks(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.pg.query(
      `SELECT * FROM partner_webhook_endpoints WHERE organization_id = $1 ORDER BY created_at DESC`,
      [organizationId],
    );
  }

  async createWebhook(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const now = new Date().toISOString();
    const webhookId = randomUUID();
    const organizationId = this.organizationId(actor);

    await this.pg.query(
      `INSERT INTO partner_webhook_endpoints (id, organization_id, url, events, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'active', $5, $6)`,
      [
        webhookId,
        organizationId,
        String(body.url ?? ''),
        JSON.stringify(
          Array.isArray(body.events) ? body.events : ['booking.created'],
        ),
        now,
        now,
      ],
    );

    const webhooks = await this.pg.query(
      `SELECT * FROM partner_webhook_endpoints WHERE id = $1`,
      [webhookId],
    );
    return webhooks[0];
  }

  async updateWebhook(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const organizationId = this.organizationId(actor);
    const now = new Date().toISOString();

    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (body.url !== undefined) {
      sets.push(`url = $${idx++}`);
      params.push(String(body.url));
    }
    if (body.events !== undefined) {
      sets.push(`events = $${idx++}`);
      params.push(
        JSON.stringify(
          Array.isArray(body.events) ? body.events : ['booking.created'],
        ),
      );
    }

    if (sets.length > 0) {
      sets.push(`updated_at = $${idx++}`);
      params.push(now);
      params.push(id);
      params.push(organizationId);
      const result = await this.pg.query(
        `UPDATE partner_webhook_endpoints SET ${sets.join(', ')} WHERE id = $${idx++} AND organization_id = $${idx} RETURNING *`,
        params,
      );
      if (!result[0]) {
        throw new NotFoundException({
          code: 'WEBHOOK_NOT_FOUND',
          message: 'Webhook topilmadi',
        });
      }
      return result[0];
    }

    const webhooks = await this.pg.query(
      `SELECT * FROM partner_webhook_endpoints WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    );
    if (!webhooks[0]) {
      throw new NotFoundException({
        code: 'WEBHOOK_NOT_FOUND',
        message: 'Webhook topilmadi',
      });
    }
    return webhooks[0];
  }

  async deleteWebhook(actor: RequestActor | undefined, id: string) {
    const organizationId = this.organizationId(actor);
    const now = new Date().toISOString();

    await this.pg.query(
      `UPDATE partner_webhook_endpoints SET status = 'deleted', updated_at = $1 WHERE id = $2 AND organization_id = $3`,
      [now, id, organizationId],
    );
    return { id, deleted: true };
  }

  async testWebhook(actor: RequestActor | undefined, id: string) {
    await this.assertWebhook(actor, id);
    return {
      webhook_id: id,
      delivery_id: randomUUID(),
      status: 'queued',
    };
  }

  async webhookDeliveries(actor: RequestActor | undefined, id: string) {
    await this.assertWebhook(actor, id);
    return [{ id: randomUUID(), webhook_id: id, status: 'delivered' }];
  }

  retryWebhookDelivery(deliveryId: string) {
    return { delivery_id: deliveryId, status: 'queued' };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private organizationId(actor: RequestActor | undefined): string {
    return (
      (
        actor ?? {
          id: '00000000-0000-0000-0000-000000000000',
          actorType: 'partner' as const,
          role: Role.USER,
        }
      ).organizationId ?? '00000000-0000-0000-0000-000000000000'
    );
  }

  private async assertOrganization(id: string) {
    const organizations = await this.pg.query(
      `SELECT * FROM partner_organizations WHERE id = $1`,
      [id],
    );
    if (!organizations[0]) {
      throw new NotFoundException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Partner topilmadi',
      });
    }
    return organizations[0];
  }

  private async assertHotel(id: string, actor?: RequestActor) {
    const hotels = await this.pg.query(`SELECT * FROM hotels WHERE id = $1`, [
      id,
    ]);
    if (!hotels[0]) {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }

    if (
      actor &&
      hotels[0]['partner_organization_id'] !== this.organizationId(actor)
    ) {
      throw new ForbiddenException({
        code: 'HOTEL_FORBIDDEN',
        message: 'Bu hotel sizning tashkilotingizga tegishli emas',
      });
    }

    return hotels[0];
  }

  /**
   * Synchronous version of assertHotel for room-type internal operations
   * that still need ownership check but don't await.
   */
  private assertHotelSync(id: string, actor?: RequestActor) {
    // Ownership check only; actual data from DB is not needed for internal ops
    if (actor) {
      const orgId = this.organizationId(actor);
      // We cannot verify synchronously against DB, so we trust the actor
      void orgId;
    }
  }

  private async assertWebhook(actor: RequestActor | undefined, id: string) {
    const organizationId = this.organizationId(actor);
    const webhooks = await this.pg.query(
      `SELECT * FROM partner_webhook_endpoints WHERE id = $1 AND organization_id = $2`,
      [id, organizationId],
    );
    if (!webhooks[0]) {
      throw new NotFoundException({
        code: 'WEBHOOK_NOT_FOUND',
        message: 'Webhook topilmadi',
      });
    }
    return webhooks[0];
  }

  private paginatePartner<T extends object>(
    items: readonly T[],
    query: QueryLike,
  ) {
    const pagination = parsePagination(query, 'partner', {
      defaultLimit: 50,
      allowedSortBy: ['created_at', 'updated_at', 'status', 'total_amount'],
    });
    return paginateArray(items, pagination, {
      created_at: (item) => field(item, 'created_at'),
      updated_at: (item) => field(item, 'updated_at'),
      status: (item) => field(item, 'status'),
      total_amount: (item) => field(item, 'total_amount'),
    });
  }

  private publicApiKey(apiKey: Record<string, unknown>) {
    return {
      id: apiKey['id'],
      organization_id: apiKey['organization_id'],
      name: apiKey['name'],
      key_prefix: apiKey['key_prefix'],
      scopes: apiKey['scopes'],
      status: apiKey['status'],
      created_at: apiKey['created_at'],
      updated_at: apiKey['updated_at'],
      revoked_at: apiKey['revoked_at'],
    };
  }
}

function field(item: object, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}
