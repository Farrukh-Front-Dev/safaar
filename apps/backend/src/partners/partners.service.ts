import {
  BadRequestException,
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
type PublicPartnerStatus =
  | 'not_found'
  | 'new'
  | 'reviewing'
  | 'approved'
  | 'rejected';

const DEMO_PARTNER_ORGANIZATION_ID = '00000000-0000-3001-0000-000000000001';

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
    const organization = (await this.profile(actor)) as Record<string, unknown>;
    const now = new Date().toISOString();
    const brandName = body.brand_name
      ? String(body.brand_name)
      : String(organization['brand_name'] ?? '');
    const phone = body.phone
      ? String(body.phone)
      : String(organization['phone'] ?? '');
    const email = body.email
      ? String(body.email).toLowerCase()
      : String(organization['email'] ?? '');
    const address = body.address
      ? String(body.address)
      : String(organization['address'] ?? '');
    const taxId = body.tax_id ?? body.taxId ?? organization['tax_id'];

    const result = await this.pg.query(
      `UPDATE partner_organizations SET brand_name = $1, phone = $2, email = $3, address = $4, tax_id = $5, updated_at = $6 WHERE id = $7 RETURNING *`,
      [brandName, phone, email, address, taxId, now, organization['id']],
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
    const organization = (await this.profile(actor)) as Record<string, unknown>;
    return {
      organization_id: String(organization['id'] ?? ''),
      status: String(organization['status'] ?? ''),
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

  async submitPublicPartnerRequest(body: Record<string, unknown>) {
    const phone = this.normalizePhone(body.phone);
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const brandName = String(
      body.companyName ?? body.brandName ?? body.company_name ?? '',
    ).trim();
    const legalName = String(
      body.legalName ?? body.legal_name ?? brandName,
    ).trim();
    const taxId = this.normalizeTaxId(body.taxId ?? body.tax_id);
    const fieldErrors: Record<string, string> = {};

    if (!brandName) {
      fieldErrors.companyName = 'Obyekt yoki kompaniya nomini kiriting';
    }
    if (!legalName) {
      fieldErrors.companyName = 'Yuridik nomni kiriting';
    }
    if (!phone) {
      fieldErrors.phone = 'Telefon raqamni kiriting';
    } else if (!this.isValidUzPhone(phone)) {
      fieldErrors.phone = "Telefon noto'g'ri formatda";
    }
    if (!email) {
      fieldErrors.email = 'Email kiriting';
    } else if (!this.isValidEmail(email)) {
      fieldErrors.email = "Email noto'g'ri formatda";
    }
    if (!taxId) {
      fieldErrors.taxId = 'STIR raqamini kiriting';
    } else if (!/^\d{9}$/.test(taxId)) {
      fieldErrors.taxId = "STIR 9 ta raqamdan iborat bo'lishi kerak";
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new BadRequestException({
        code: 'PARTNER_REQUEST_INVALID',
        message: "Hamkor arizasi ma'lumotlarini tekshiring",
        fields: fieldErrors,
      });
    }

    const duplicates = await this.pg.query(
      `
        select id::text,
               regexp_replace(phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g') as phone_match,
               lower(email) = lower($2) as email_match,
               tax_id = $3 as tax_id_match
        from partner_organizations
        where regexp_replace(phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g')
           or lower(email) = lower($2)
           or tax_id = $3
        order by created_at desc
        limit 10
      `,
      [phone, email, taxId],
    );

    const duplicateErrors: Record<string, string> = {};
    for (const duplicate of duplicates) {
      if (duplicate['phone_match']) {
        duplicateErrors.phone =
          'Bu telefon raqam bilan ariza yoki hamkor mavjud';
      }
      if (duplicate['email_match']) {
        duplicateErrors.email = 'Bu email bilan ariza yoki hamkor mavjud';
      }
      if (duplicate['tax_id_match']) {
        duplicateErrors.taxId = 'Bu STIR bilan ariza yoki hamkor mavjud';
      }
    }

    if (Object.keys(duplicateErrors).length > 0) {
      throw new BadRequestException({
        code: 'PARTNER_REQUEST_DUPLICATE',
        message: "Bu ma'lumotlar bilan ariza yoki hamkor allaqachon mavjud",
        fields: duplicateErrors,
      });
    }

    const now = new Date().toISOString();
    const cityId = await this.resolveCityId(body.city ?? body.city_id);
    const partnerType = this.partnerType(body.type);
    const address = this.optionalString(body.address);

    const id = randomUUID();
    const inserted = await this.pg.query(
      `
        insert into partner_organizations (
          id, type, legal_name, brand_name, tax_id, phone, email, city_id,
          address, status, default_commission_rate, created_at, updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8::uuid, $9, 'submitted', 12.00, $10, $10)
        returning id::text, type::text, legal_name, brand_name, tax_id, phone,
                  email, city_id::text, address, status::text, rejection_reason,
                  created_at, updated_at
      `,
      [
        id,
        partnerType,
        legalName,
        brandName,
        taxId,
        phone,
        email,
        cityId,
        address,
        now,
      ],
    );

    return { item: this.publicPartnerRequestDto(inserted[0]) };
  }

  async publicPartnerRequestStatus(phone?: string, email?: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const normalizedEmail = String(email ?? '')
      .trim()
      .toLowerCase();

    if (!normalizedPhone && !normalizedEmail) {
      return {
        found: false,
        status: 'not_found' satisfies PublicPartnerStatus,
        request: null,
      };
    }

    const rows = await this.pg.query(
      `
        select id::text, type::text, legal_name, brand_name, tax_id, phone,
               email, city_id::text, address, status::text, rejection_reason,
               created_at, updated_at
        from partner_organizations
        where ($1::text <> '' and regexp_replace(phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g'))
           or ($2::text <> '' and lower(email) = lower($2))
        order by created_at desc
        limit 1
      `,
      [normalizedPhone, normalizedEmail],
    );

    if (!rows[0]) {
      return {
        found: false,
        status: 'not_found' satisfies PublicPartnerStatus,
        request: null,
      };
    }

    const request = this.publicPartnerRequestDto(rows[0]);
    return {
      found: true,
      status: request.status,
      request,
    };
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

    const rows = await this.pg.query(
      `SELECT * FROM hotels WHERE partner_organization_id = $1 ORDER BY ${sortColumn} ${orderDir} LIMIT $2 OFFSET $3`,
      [organizationId, pagination.limit, pagination.offset],
    );
    return this.hydratePartnerHotels(rows);
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
      image_ids: [],
    };
  }

  async hotel(actor: RequestActor | undefined, id: string) {
    const hotel = await this.assertHotel(id, actor);
    const [hydrated] = await this.hydratePartnerHotels([hotel]);
    return hydrated;
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
    const imageUrl = this.optionalString(body.url ?? body.image_url);
    if (!imageUrl) {
      throw new BadRequestException({
        code: 'IMAGE_URL_REQUIRED',
        message: 'Rasm URL manzili kerak',
      });
    }

    const imageId = randomUUID();
    const now = new Date().toISOString();
    await this.pg.query(
      `INSERT INTO media_files (id, owner_type, owner_id, bucket, object_key, url, mime_type, size, visibility, created_at)
       VALUES ($1, 'hotel', $2::uuid, 'external', $3, $3, 'image/*', 0, 'public', $4)`,
      [imageId, id, imageUrl, now],
    );
    await this.touchHotel(id, now);
    return { hotel_id: id, image_id: imageId, image_url: imageUrl };
  }

  async deleteHotelImage(
    actor: RequestActor | undefined,
    id: string,
    imageId: string,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const result = await this.pg.query<{ id: string }>(
      `UPDATE media_files
       SET deleted_at = $1
       WHERE owner_type = 'hotel'
         AND owner_id = $2::uuid
         AND deleted_at IS NULL
         AND (id::text = $3 OR url = $3)
       RETURNING id::text`,
      [now, id, imageId],
    );
    await this.touchHotel(id, now);
    return {
      hotel_id: id,
      image_id: result[0]?.id ?? imageId,
      deleted: result.length > 0,
    };
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
    return this.pg.query(
      `SELECT rt.id::text, rt.code, rt.name, rt.created_at, rt.updated_at,
        COALESCE(MIN(hr.base_price)::float8, 0) as base_price,
        COALESCE(MAX(hr.max_adults), 2) as max_adults,
        COALESCE(MAX(hr.base_occupancy), 2) as base_occupancy
       FROM room_types rt
       LEFT JOIN hotel_rooms hr ON hr.room_type_id = rt.id AND hr.hotel_id = $1
       GROUP BY rt.id, rt.code, rt.name, rt.created_at, rt.updated_at
       ORDER BY rt.name ->> 'uz' ASC`,
      [id],
    );
  }

  async createRoomType(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const roomTypeId = randomUUID();
    const now = new Date().toISOString();
    const name = localizedText(body, 'name', 'Yangi xona turi');
    const code = this.slugify(name.uz || `room-type-${Date.now()}`);
    const [roomType] = await this.pg.query(
      `INSERT INTO room_types (id, code, name, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $4)
       ON CONFLICT (code) DO UPDATE
       SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at
       RETURNING id::text, code, name, created_at, updated_at`,
      [roomTypeId, code, JSON.stringify(name), now],
    );
    return {
      ...roomType,
      base_price: Number(body.base_price ?? body.basePrice ?? 0),
      max_adults: Number(body.capacity ?? body.max_adults ?? 2),
      base_occupancy: Number(body.capacity ?? body.base_occupancy ?? 2),
    };
  }

  async updateRoomType(
    actor: RequestActor | undefined,
    id: string,
    roomTypeId: string,
    body: Record<string, unknown>,
  ) {
    await this.assertHotel(id, actor);
    const now = new Date().toISOString();
    const name = localizedText(body, 'name', 'Xona');
    const rows = await this.pg.query(
      `UPDATE room_types
       SET name = $1::jsonb, updated_at = $2
       WHERE id = $3::uuid
       RETURNING id::text, code, name, created_at, updated_at`,
      [JSON.stringify(name), now, roomTypeId],
    );
    if (!rows[0]) {
      throw new NotFoundException({
        code: 'ROOM_TYPE_NOT_FOUND',
        message: 'Xona turi topilmadi',
      });
    }
    return rows[0];
  }

  async deleteRoomType(
    actor: RequestActor | undefined,
    id: string,
    roomTypeId: string,
  ) {
    await this.assertHotel(id, actor);
    const rooms = await this.pg.query(
      `SELECT id::text FROM hotel_rooms WHERE hotel_id = $1 AND room_type_id = $2 LIMIT 1`,
      [id, roomTypeId],
    );
    if (rooms[0]) {
      return {
        ok: false,
        reason:
          "Bu turdan foydalanayotgan xonalar bor. Avval ularni boshqa turga o'tkazing.",
      };
    }

    await this.pg.query(
      `DELETE FROM room_types WHERE id = $1::uuid AND NOT EXISTS (
        SELECT 1 FROM hotel_rooms WHERE room_type_id = $1::uuid
      )`,
      [roomTypeId],
    );
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
    const rooms = await this.pg.query<{ id: string; total_inventory: number }>(
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

    if (body.city_id !== undefined || body.city !== undefined) {
      const resolvedCityId = await this.resolveCityId(
        body.city_id ?? body.city,
      );
      sets.push(`city_id = $${idx++}`);
      params.push(resolvedCityId);
    }
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
      const codes = body.amenities.map(String);

      // Resolve codes → UUIDs from the amenities table
      const resolved = await this.pg.query<{ code: string; id: string }>(
        `SELECT code, id::text FROM amenities WHERE code = ANY($1::text[])`,
        [codes],
      );
      const codeToId = new Map(resolved.map((r) => [r.code, r.id]));

      await this.pg.query(`DELETE FROM hotel_amenities WHERE hotel_id = $1`, [
        id,
      ]);
      for (const code of codes) {
        const amenityId = codeToId.get(code);
        if (!amenityId) continue; // skip unknown codes silently
        await this.pg.query(
          `INSERT INTO hotel_amenities (hotel_id, amenity_id)
           VALUES ($1::uuid, $2::uuid)
           ON CONFLICT (hotel_id, amenity_id) DO NOTHING`,
          [id, amenityId],
        );
      }
      await this.pg.query(`UPDATE hotels SET updated_at = $1 WHERE id = $2`, [
        now,
        id,
      ]);
    }
    return this.hotel(actor, id);
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
    const rooms = await this.pg.query<{
      id: string;
      room_type_id: string;
      base_price: number;
    }>(
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
        BookingStatus.CONFIRMED.toLowerCase(),
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
      params.push(BookingStatus.CONFIRMED.toLowerCase());
    } else if (status === 'checked_in') {
      sets.push(`status = $${paramIdx++}`);
      params.push(BookingStatus.CONFIRMED.toLowerCase());
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
      params.push(BookingStatus.COMPLETED.toLowerCase());
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
      [BookingStatus.CANCELLED.toLowerCase(), reason, now, id],
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
          id: 'demo-partner-user-id',
          actorType: 'partner' as const,
          role: Role.PARTNER,
        }
      ).organizationId ?? DEMO_PARTNER_ORGANIZATION_ID
    );
  }

  private normalizePhone(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) {
      return '';
    }

    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      return `+${digits}`;
    }
    if (digits.length === 9) {
      return `+998${digits}`;
    }
    return raw.startsWith('+') ? `+${digits}` : raw;
  }

  private isValidUzPhone(value: string): boolean {
    return /^\+998\d{9}$/.test(value);
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private normalizeTaxId(value: unknown): string {
    return String(value ?? '').replace(/\D/g, '');
  }

  private optionalString(value: unknown): string | null {
    const text = String(value ?? '').trim();
    return text.length > 0 ? text : null;
  }

  private partnerType(value: unknown): 'hotel' | 'bus' | 'mixed' {
    const type = String(value ?? 'hotel').toLowerCase();
    if (type === 'bus') {
      return 'bus';
    }
    if (type === 'mixed') {
      return 'mixed';
    }
    return 'hotel';
  }

  private slugify(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || `room-type-${Date.now()}`;
  }

  private publicStatus(value: unknown): PublicPartnerStatus {
    const status = String(value ?? '').toLowerCase();
    if (status === 'approved') {
      return 'approved';
    }
    if (status === 'rejected') {
      return 'rejected';
    }
    if (status === 'under_review' || status === 'submitted') {
      return 'reviewing';
    }
    return 'new';
  }

  private publicPartnerRequestDto(row: Record<string, unknown>) {
    return {
      id: String(row['id']),
      organizationId: String(row['id']),
      companyName: String(row['brand_name'] ?? row['legal_name'] ?? 'Hamkor'),
      contactPerson: String(
        row['legal_name'] ?? row['brand_name'] ?? 'Masul shaxs',
      ),
      phone: String(row['phone'] ?? ''),
      email: String(row['email'] ?? ''),
      city: String(row['city'] ?? row['city_id'] ?? ''),
      address: String(row['address'] ?? ''),
      taxId: row['tax_id'] ? String(row['tax_id']) : undefined,
      type: String(row['type'] ?? 'hotel'),
      status: this.publicStatus(row['status']),
      rejectionReason: row['rejection_reason']
        ? String(row['rejection_reason'])
        : undefined,
      createdAt: String(row['created_at'] ?? ''),
      updatedAt: String(row['updated_at'] ?? ''),
    };
  }

  private async hydratePartnerHotels(rows: Array<Record<string, unknown>>) {
    if (rows.length === 0) {
      return [];
    }

    const ids = rows.map((row) => String(row['id']));
    const [translations, images, amenities] = await Promise.all([
      this.pg.query<{
        hotel_id: string;
        language: string;
        name: string | null;
        description: string | null;
      }>(
        `SELECT hotel_id::text, language::text, name, description
         FROM hotel_translations
         WHERE hotel_id = ANY($1::uuid[])`,
        [ids],
      ),
      this.pg.query<{ id: string; owner_id: string; url: string }>(
        `SELECT id::text, owner_id::text, url
         FROM media_files
         WHERE owner_type = 'hotel'
           AND owner_id = ANY($1::uuid[])
           AND deleted_at IS NULL
           AND url IS NOT NULL
         ORDER BY created_at ASC`,
        [ids],
      ),
      this.pg.query<{ hotel_id: string; code: string }>(
        `SELECT ha.hotel_id::text, a.code
         FROM hotel_amenities ha
         JOIN amenities a ON a.id = ha.amenity_id
         WHERE ha.hotel_id = ANY($1::uuid[])`,
        [ids],
      ),
    ]);

    const nameMap = new Map<string, Record<string, string>>();
    const descriptionMap = new Map<string, Record<string, string>>();
    const imageUrlMap = new Map<string, string[]>();
    const imageIdMap = new Map<string, string[]>();
    const amenityMap = new Map<string, string[]>();

    for (const row of translations) {
      const names = nameMap.get(row.hotel_id) ?? {};
      const descriptions = descriptionMap.get(row.hotel_id) ?? {};
      if (row.name) names[row.language] = row.name;
      if (row.description) descriptions[row.language] = row.description;
      nameMap.set(row.hotel_id, names);
      descriptionMap.set(row.hotel_id, descriptions);
    }

    for (const row of images) {
      const urls = imageUrlMap.get(row.owner_id) ?? [];
      const imageIds = imageIdMap.get(row.owner_id) ?? [];
      urls.push(row.url);
      imageIds.push(row.id);
      imageUrlMap.set(row.owner_id, urls);
      imageIdMap.set(row.owner_id, imageIds);
    }

    for (const row of amenities) {
      const codesForHotel = amenityMap.get(row.hotel_id) ?? [];
      codesForHotel.push(row.code);
      amenityMap.set(row.hotel_id, codesForHotel);
    }

    return rows.map((row) => {
      const id = String(row['id']);
      return {
        ...row,
        id,
        partner_organization_id: String(row['partner_organization_id'] ?? ''),
        city_id: String(row['city_id'] ?? ''),
        latitude:
          row['latitude'] === null || row['latitude'] === undefined
            ? null
            : Number(row['latitude']),
        longitude:
          row['longitude'] === null || row['longitude'] === undefined
            ? null
            : Number(row['longitude']),
        stars: Number(row['stars'] ?? 0),
        rating_average: Number(row['rating_average'] ?? 0),
        reviews_count: Number(row['reviews_count'] ?? 0),
        name: localizedTextFromMap(
          nameMap.get(id),
          String(row['slug'] ?? 'Mehmonxona'),
        ),
        description: localizedTextFromMap(descriptionMap.get(id), ''),
        amenities: amenityMap.get(id) ?? [],
        images: imageUrlMap.get(id) ?? [],
        image_ids: imageIdMap.get(id) ?? [],
      };
    });
  }

  private async touchHotel(id: string, date = new Date().toISOString()) {
    await this.pg.query(`UPDATE hotels SET updated_at = $1 WHERE id = $2`, [
      date,
      id,
    ]);
  }

  private async resolveCityId(value: unknown): Promise<string> {
    const city = String(value ?? '').trim();

    if (/^[0-9a-f-]{36}$/i.test(city)) {
      return city;
    }

    if (city) {
      const rows = await this.pg.query<{ id: string }>(
        `
          select id::text
          from cities
          where lower(name ->> 'uz') = lower($1)
             or lower(name ->> 'ru') = lower($1)
             or lower(name ->> 'en') = lower($1)
             or lower(name::text) like '%' || lower($1) || '%'
          order by created_at asc
          limit 1
        `,
        [city],
      );

      if (rows[0]) {
        return rows[0].id;
      }
    }

    const fallback = await this.pg.query<{ id: string }>(
      `select id::text from cities order by created_at asc limit 1`,
    );

    if (!fallback[0]) {
      throw new BadRequestException({
        code: 'CITY_NOT_FOUND',
        message: 'Shahar topilmadi',
      });
    }

    return fallback[0].id;
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

function localizedTextFromMap(
  value: Record<string, string> | undefined,
  fallback: string,
) {
  return {
    uz: value?.uz ?? fallback,
    ru: value?.ru ?? value?.uz ?? fallback,
    en: value?.en ?? value?.uz ?? fallback,
  };
}
