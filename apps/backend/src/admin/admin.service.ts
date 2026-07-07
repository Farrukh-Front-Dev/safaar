import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import {
  limitOffsetSql,
  paginateArray,
  parsePagination,
  type QueryLike,
} from '../common/pagination';
import { AppCacheService } from '../infrastructure/cache.service';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { PostgresService } from '../infrastructure/postgres.service';

type DbRow = Record<string, unknown>;

function numberValue(value: unknown): number {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function cmsTypesForResource(resource: string): string[] {
  if (resource === 'banners') {
    return ['banner'];
  }
  if (resource === 'offers') {
    return ['offer', 'promo'];
  }
  if (resource === 'news') {
    return ['news'];
  }
  if (resource === 'pages') {
    return ['page'];
  }
  return [resource.replace(/s$/, '')];
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function field(item: object, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}

function adminActorUuid(actor: RequestActor | undefined): string {
  return actor && isUuid(actor.id)
    ? actor.id
    : '00000000-0000-0000-0000-000000000000';
}

function normalizeUserStatus(
  value: unknown,
): 'active' | 'blocked' | 'deleted' | 'unverified' {
  const status = String(value ?? 'active').toLowerCase();
  if (
    status === 'active' ||
    status === 'blocked' ||
    status === 'deleted' ||
    status === 'unverified'
  ) {
    return status;
  }
  return 'active';
}

function normalizeSupportStatus(
  value: unknown,
): 'open' | 'in_progress' | 'closed' {
  const status = String(value ?? 'open').toLowerCase();
  if (status === 'closed' || status === 'in_progress') {
    return status;
  }
  return 'open';
}

function normalizeWithdrawalStatus(
  value: unknown,
): 'approved' | 'rejected' | 'paid' | 'requested' {
  const status = String(value ?? 'requested').toLowerCase();
  if (status === 'approved' || status === 'rejected' || status === 'paid') {
    return status;
  }
  return 'requested';
}

/**
 * Super Admin xizmati — admin.uzbron.uz.
 * Platforma statistikasi, hamkor tasdiqlash, moliya hisobotlari.
 */
@Injectable()
export class AdminService {
  private readonly cmsStore: Record<string, Array<Record<string, unknown>>> = {
    banners: [],
    offers: [],
    news: [],
    pages: [],
    templates: [],
    'faq-categories': [],
    faqs: [],
  };
  private readonly promosStore: Array<Record<string, unknown>> = [];
  private readonly broadcastsStore: Array<Record<string, unknown>> = [];
  private readonly adminUsersStore: Array<Record<string, unknown>> = [
    {
      id: 'demo-admin-id',
      email: 'admin@uzbron.uz',
      role: 'super_admin',
      status: 'active',
    },
  ];

  constructor(
    private readonly cache: AppCacheService,
    private readonly db: InMemoryDbService,
    private readonly jobs: JobQueueService,
    private readonly postgres: PostgresService,
  ) {}

  private async rows(sql: string, params: readonly unknown[] = []) {
    return this.postgres.tryQuery<DbRow>(sql, params);
  }

  private adminPagination(query: QueryLike = {}) {
    return parsePagination(query, 'admin', {
      defaultLimit: 50,
      allowedSortBy: [
        'created_at',
        'updated_at',
        'status',
        'total_amount',
        'amount',
        'rating_average',
      ],
    });
  }

  private limitClause(query: QueryLike = {}) {
    return limitOffsetSql(this.adminPagination(query));
  }

  private paginateAdmin<T extends object>(
    items: readonly T[],
    query: QueryLike = {},
  ) {
    return paginateArray(items, this.adminPagination(query), {
      created_at: (item) => field(item, 'created_at'),
      updated_at: (item) => field(item, 'updated_at'),
      status: (item) => field(item, 'status'),
      total_amount: (item) => field(item, 'total_amount'),
      amount: (item) => field(item, 'amount'),
      rating_average: (item) => field(item, 'rating_average'),
    });
  }

  private invalidateAdminCache() {
    void this.cache.delByPattern('admin:*');
  }

  private dbBookingsSql(where = '') {
    return `
      select
        b.id::text,
        b.booking_number,
        b.user_id::text,
        b.partner_organization_id::text,
        b.type::text,
        b.confirmation_mode::text,
        b.payment_method::text,
        b.status::text,
        b.currency,
        b.subtotal::float8,
        b.discount_amount::float8,
        b.bonus_amount::float8,
        b.service_fee::float8,
        b.total_amount::float8,
        b.commission_amount::float8,
        b.partner_payable::float8,
        b.hotel_id::text,
        b.trip_id::text,
        b.partner_confirmation_deadline,
        b.expires_at,
        b.confirmed_at,
        b.cancelled_at,
        b.cancel_reason_text,
        b.policy_snapshot,
        b.price_snapshot,
        (
          coalesce(b.price_snapshot, '{}'::jsonb) ||
          jsonb_strip_nulls(
            jsonb_build_object(
              'hotel_id', b.hotel_id::text,
              'trip_id', b.trip_id::text,
              'check_in', b.price_snapshot ->> 'checkIn',
              'check_out', b.price_snapshot ->> 'checkOut',
              'room_type', b.price_snapshot ->> 'roomType',
              'seatNumber', b.price_snapshot ->> 'seatNumber',
              'seats', case
                when b.price_snapshot ? 'seatNumber'
                  then jsonb_build_array(b.price_snapshot ->> 'seatNumber')
                else null
              end
            )
          )
        ) as item,
        b.price_snapshot ->> 'route' as route,
        b.price_snapshot ->> 'companyName' as company_name,
        b.created_at,
        b.updated_at
      from bookings b
      ${where}
      order by b.created_at desc
    `;
  }

  async getOverview() {
    return this.cache.getOrSet('admin:dashboard:overview', 30, async () => {
      const rows = await this.rows(`
        select
          (select count(*) from users where deleted_at is null)::int as total_users,
          (select count(*) from partner_organizations where status = 'approved')::int as active_partners,
          (select count(*) from bookings)::int as today_bookings,
          coalesce((select sum(amount) from payments where status = 'paid'), 0)::float8 as monthly_revenue
      `);

      if (rows?.[0]) {
        return {
          totalUsers: numberValue(rows[0]['total_users']),
          activePartners: numberValue(rows[0]['active_partners']),
          todayBookings: numberValue(rows[0]['today_bookings']),
          monthlyRevenue: numberValue(rows[0]['monthly_revenue']),
        };
      }

      return {
        totalUsers: this.db.users.length,
        activePartners: this.db.partnerOrganizations.filter(
          (partner) => partner.status === 'approved',
        ).length,
        todayBookings: this.db.bookings.length,
        monthlyRevenue: this.db.payments
          .filter((payment) => payment.status === 'paid')
          .reduce((sum, payment) => sum + payment.amount, 0),
      };
    });
  }

  chart(type: string) {
    return [{ date: new Date().toISOString().slice(0, 10), type, value: 0 }];
  }

  async activity() {
    const rows = await this.rows(`
      select id::text, actor_type, actor_id::text, action, entity_type, entity_id::text,
             old_value, new_value, metadata, ip_address, user_agent, request_id, created_at
      from audit_logs
      order by created_at desc
      limit 20
    `);
    return rows ?? this.db.auditLogs.slice(0, 20);
  }

  async users(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        u.id::text,
        u.phone,
        u.first_name,
        u.last_name,
        u.email,
        u.status::text,
        u.preferred_language::text,
        u.blocked_reason,
        u.phone_verified_at,
        u.last_login_at,
        coalesce(count(b.id), 0)::int as bookings_count,
        coalesce(sum(b.total_amount), 0)::float8 as total_spent,
        0::float8 as bonus_balance,
        u.created_at,
        u.updated_at
      from users u
      left join bookings b on b.user_id = u.id
      where u.deleted_at is null
      group by u.id
      order by u.created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.users, query);
  }

  async user(id: string) {
    if (!isUuid(id)) {
      const user = this.db.findUser(id);
      if (!user) {
        throw new NotFoundException({
          code: 'USER_BLOCKED',
          message: 'User topilmadi',
        });
      }
      return user;
    }

    const rows = await this.rows(
      `
        select
          u.id::text,
          u.phone,
          u.first_name,
          u.last_name,
          u.email,
          u.status::text,
          u.preferred_language::text,
          u.blocked_reason,
          u.phone_verified_at,
          u.last_login_at,
          coalesce(count(b.id), 0)::int as bookings_count,
          coalesce(sum(b.total_amount), 0)::float8 as total_spent,
          0::float8 as bonus_balance,
          u.created_at,
          u.updated_at
        from users u
        left join bookings b on b.user_id = u.id
        where u.id = $1::uuid and u.deleted_at is null
        group by u.id
      `,
      [id],
    );

    if (rows?.[0]) {
      return rows[0];
    }

    const user = this.db.findUser(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_BLOCKED',
        message: 'User topilmadi',
      });
    }
    return user;
  }

  async userStatus(id: string, body: Record<string, unknown>) {
    const status = normalizeUserStatus(body.status);
    if (isUuid(id)) {
      const rows = await this.rows(
        `
          update users
          set status = $2::"UserStatus",
              blocked_reason = case
                when $2 = 'blocked' then nullif($3, '')
                else blocked_reason
              end,
              deleted_at = case
                when $2 = 'deleted' then coalesce(deleted_at, now())
                else deleted_at
              end,
              updated_at = now()
          where id = $1::uuid
          returning
            id::text,
            phone,
            email,
            first_name,
            last_name,
            concat_ws(' ', first_name, last_name) as full_name,
            status::text,
            preferred_language,
            blocked_reason,
            last_login_at,
            created_at,
            updated_at
        `,
        [id, status, String(body.reason ?? '')],
      );
      if (rows?.[0]) {
        this.invalidateAdminCache();
        return rows[0];
      }
    }

    const user = await this.user(id);
    user.status = status;
    user.updated_at = this.db.now();
    this.invalidateAdminCache();
    return user;
  }

  async userDelete(actor: RequestActor | undefined, id: string) {
    if (isUuid(id)) {
      const rows = await this.rows(
        `
          update users
          set status = 'deleted'::"UserStatus",
              deleted_at = coalesce(deleted_at, now()),
              updated_at = now()
          where id = $1::uuid
          returning
            id::text,
            phone,
            email,
            first_name,
            last_name,
            concat_ws(' ', first_name, last_name) as full_name,
            status::text,
            preferred_language,
            blocked_reason,
            last_login_at,
            created_at,
            updated_at,
            deleted_at
        `,
        [id],
      );
      if (rows?.[0]) {
        this.db.audit('user.admin_delete', actor, { user_id: id });
        this.invalidateAdminCache();
        return rows[0];
      }
    }

    const user = await this.user(id);
    user.status = 'deleted';
    user.updated_at = this.db.now();
    this.db.audit('user.admin_delete', actor, { user_id: id });
    this.invalidateAdminCache();
    return user;
  }

  async bonusAdjustment(id: string, body: Record<string, unknown>) {
    const user = await this.user(id);
    const amount = Number(body.amount ?? 0);
    const currentBalance = numberValue(user['bonus_balance']);
    return { user_id: id, amount, balance: currentBalance + amount };
  }

  async userBookings(id: string, query: QueryLike = {}) {
    if (!isUuid(id)) {
      return this.paginateAdmin(
        this.db.bookings.filter((booking) => booking.user_id === id),
        query,
      );
    }

    const rows = await this.rows(
      `${this.dbBookingsSql('where b.user_id = $1::uuid')} ${this.limitClause(query)}`,
      [id],
    );
    return (
      rows ??
      this.paginateAdmin(
        this.db.bookings.filter((booking) => booking.user_id === id),
        query,
      )
    );
  }

  async userAudit(id: string, query: QueryLike = {}) {
    if (!isUuid(id)) {
      return this.paginateAdmin(
        this.db.auditLogs.filter((log) => log['actor_id'] === id),
        query,
      );
    }

    const rows = await this.rows(
      `
        select id::text, actor_type, actor_id::text, action, entity_type, entity_id::text,
               old_value, new_value, metadata, ip_address, user_agent, request_id, created_at
        from audit_logs
        where actor_id = $1::uuid
        order by created_at desc
        ${this.limitClause(query)}
      `,
      [id],
    );
    return (
      rows ??
      this.paginateAdmin(
        this.db.auditLogs.filter((log) => log['actor_id'] === id),
        query,
      )
    );
  }

  async userMessage(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const title = String(body.title ?? 'Admin xabari');
    const message = String(body.message ?? body.body ?? '');

    if (isUuid(id)) {
      const rows = await this.rows(
        `
          insert into notifications (user_id, owner_type, owner_id, title, body)
          values ($1::uuid, 'user', $1::uuid, $2, $3)
          returning
            id::text,
            user_id::text,
            owner_type,
            owner_id::text,
            title,
            body,
            read_at,
            created_at
        `,
        [id, title, message],
      );
      if (rows?.[0]) {
        this.db.audit('user.admin_message', actor, { user_id: id });
        return rows[0];
      }
    }

    const notification = {
      id: this.db.id('notification'),
      owner_id: id,
      title,
      body: message,
      created_at: this.db.now(),
    };
    this.db.notifications.unshift(notification);
    this.db.audit('user.admin_message', actor, { user_id: id });
    return notification;
  }

  async usersMessage(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const ids = Array.isArray(body.user_ids)
      ? body.user_ids.map(String)
      : Array.isArray(body.ids)
        ? body.ids.map(String)
        : [];
    const title = String(body.title ?? 'Admin xabari');
    const message = String(body.message ?? body.body ?? '');
    const targets = ids.length ? ids : this.db.users.map((user) => user.id);
    const sent: unknown[] = [];

    for (const userId of targets) {
      sent.push(
        await this.userMessage(actor, userId, { title, body: message }),
      );
    }

    return {
      sent: sent.length,
      notifications: sent,
    };
  }

  async exportJob(
    actor: RequestActor | undefined,
    type: string,
    format: 'csv' | 'xlsx' | 'pdf',
  ) {
    const currentActor = this.db.actorOrDemo(actor);
    const job = {
      id: this.db.id('export'),
      owner_id: currentActor.id,
      type,
      format,
      status: 'queued' as const,
      created_at: this.db.now(),
      updated_at: this.db.now(),
    };
    this.db.exportJobs.unshift(job);
    await this.jobs.add(
      'export',
      { export_id: job.id, type, format, owner_id: currentActor.id },
      { idempotencyKey: `export:${currentActor.id}:${type}:${format}` },
    );
    return job;
  }

  async partners(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        po.id::text,
        po.type::text,
        po.legal_name,
        po.brand_name,
        po.tax_id,
        po.phone,
        po.email,
        po.city_id::text,
        c.name ->> 'uz' as city,
        po.address,
        po.status::text,
        po.default_commission_rate::float8,
        po.approved_by::text,
        po.approved_at,
        po.rejection_reason,
        coalesce(count(b.id), 0)::int as bookings_count,
        coalesce(sum(b.total_amount), 0)::float8 as total_revenue,
        coalesce(max(h.rating_average)::float8, max(bc.rating_average)::float8, 0)::float8 as rating_average,
        po.created_at,
        po.updated_at
      from partner_organizations po
      left join cities c on c.id = po.city_id
      left join bookings b on b.partner_organization_id = po.id
      left join hotels h on h.partner_organization_id = po.id
      left join bus_companies bc on bc.partner_organization_id = po.id
      group by po.id, c.name
      order by po.created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.partnerOrganizations, query);
  }

  async partnerRequests(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        po.id::text,
        po.type::text,
        po.legal_name,
        po.brand_name,
        po.tax_id,
        po.phone,
        po.email,
        po.city_id::text,
        c.name ->> 'uz' as city,
        po.address,
        po.status::text,
        po.default_commission_rate::float8,
        po.rejection_reason,
        jsonb_build_array(
          jsonb_build_object('name', 'STIR guvohnoma', 'type', 'tax_certificate', 'url', '#'),
          jsonb_build_object('name', 'Litsenziya', 'type', 'license', 'url', '#')
        ) as documents,
        po.created_at,
        po.updated_at
      from partner_organizations po
      left join cities c on c.id = po.city_id
      where po.status <> 'approved'
      order by po.created_at desc
      ${this.limitClause(query)}
    `);
    return (
      rows ??
      this.paginateAdmin(
        this.db.partnerOrganizations.filter(
          (partner) => partner.status !== 'approved',
        ),
        query,
      )
    );
  }

  async partner(id: string) {
    const rows = await this.rows(
      `
        select
          po.id::text,
          po.type::text,
          po.legal_name,
          po.brand_name,
          po.tax_id,
          po.phone,
          po.email,
          po.city_id::text,
          c.name ->> 'uz' as city,
          po.address,
          po.status::text,
          po.default_commission_rate::float8,
          po.approved_by::text,
          po.approved_at,
          po.rejection_reason,
          coalesce(count(b.id), 0)::int as bookings_count,
          coalesce(sum(b.total_amount), 0)::float8 as total_revenue,
          coalesce(max(h.rating_average)::float8, max(bc.rating_average)::float8, 0)::float8 as rating_average,
          po.created_at,
          po.updated_at
        from partner_organizations po
        left join cities c on c.id = po.city_id
        left join bookings b on b.partner_organization_id = po.id
        left join hotels h on h.partner_organization_id = po.id
        left join bus_companies bc on bc.partner_organization_id = po.id
        where po.id = $1::uuid
        group by po.id, c.name
      `,
      [id],
    );

    if (rows?.[0]) {
      return rows[0];
    }

    const partner = this.db.partnerOrganizations.find((item) => item.id === id);
    if (!partner) {
      throw new NotFoundException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Partner topilmadi',
      });
    }
    return partner;
  }

  async partnerDecision(
    actor: RequestActor | undefined,
    id: string,
    status: 'approved' | 'rejected' | 'more_information_required',
    body: Record<string, unknown> = {},
  ) {
    const partner = await this.partner(id);
    partner.status = status;
    partner.updated_at = this.db.now();
    partner.rejection_reason = body.reason ? String(body.reason) : undefined;
    this.db.audit('partner.moderation', actor, { partner_id: id, status });
    this.invalidateAdminCache();
    return partner;
  }

  async partnerStatus(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const partner = await this.partner(id);
    partner.status = String(body.status ?? partner.status);
    partner.updated_at = this.db.now();
    this.db.audit('partner.status', actor, {
      partner_id: id,
      status: partner.status,
    });
    this.invalidateAdminCache();
    return partner;
  }

  async partnerCommission(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const partner = await this.partner(id);
    partner.default_commission_rate = Number(
      body.rate ?? body.default_commission_rate ?? 12,
    );
    partner.updated_at = this.db.now();
    this.db.audit('partner.commission', actor, {
      partner_id: id,
      rate: partner.default_commission_rate,
    });
    this.invalidateAdminCache();
    return partner;
  }

  async partnerLedger(id: string) {
    const rows = await this.rows(
      `
        select id::text, organization_id::text as partner_id, booking_id::text,
               type, amount::float8, currency, created_at
        from partner_ledger_entries
        where organization_id = $1::uuid
        order by created_at desc
      `,
      [id],
    );
    return (
      rows ??
      this.db.bookings
        .filter((booking) => booking.partner_organization_id === id)
        .map((booking) => ({
          id: this.db.id('ledger'),
          booking_id: booking.id,
          amount: booking.partner_payable,
          currency: booking.currency,
        }))
    );
  }

  async partnerAdjustment(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    await this.partner(id);
    const adjustment = {
      id: this.db.id('adjustment'),
      partner_id: id,
      amount: Number(body.amount ?? 0),
      reason: String(body.reason ?? ''),
      created_at: this.db.now(),
    };
    this.db.audit('partner.adjustment', actor, adjustment);
    return adjustment;
  }

  async hotels(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        h.id::text,
        h.partner_organization_id::text,
        h.slug,
        h.city_id::text,
        coalesce(jsonb_object_agg(ht.language, ht.name) filter (where ht.id is not null), '{}'::jsonb) as name,
        h.address,
        h.latitude::float8,
        h.longitude::float8,
        h.stars,
        h.rating_average::float8,
        h.reviews_count,
        h.status::text,
        h.check_in_time,
        h.check_out_time,
        h.created_at,
        h.updated_at
      from hotels h
      left join hotel_translations ht on ht.hotel_id = h.id
      where h.deleted_at is null
      group by h.id
      order by h.created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.hotels, query);
  }

  async hotel(id: string) {
    const rows = await this.rows(
      `
        select
          h.id::text,
          h.partner_organization_id::text,
          h.slug,
          h.city_id::text,
          coalesce(jsonb_object_agg(ht.language, ht.name) filter (where ht.id is not null), '{}'::jsonb) as name,
          h.address,
          h.latitude::float8,
          h.longitude::float8,
          h.stars,
          h.rating_average::float8,
          h.reviews_count,
          h.status::text,
          h.check_in_time,
          h.check_out_time,
          h.created_at,
          h.updated_at
        from hotels h
        left join hotel_translations ht on ht.hotel_id = h.id
        where h.id = $1::uuid and h.deleted_at is null
        group by h.id
      `,
      [id],
    );

    if (rows?.[0]) {
      return rows[0];
    }

    const hotel = this.db.hotels.find((item) => item.id === id);
    if (!hotel) {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }
    return hotel;
  }

  async hotelStatus(id: string, status: 'published' | 'hidden' | 'rejected') {
    const hotel = await this.hotel(id);
    hotel.status = status;
    this.invalidateAdminCache();
    return hotel;
  }

  async trips(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        t.id::text,
        t.route_id::text,
        t.company_id::text,
        t.vehicle_id::text,
        t.from_city_id::text,
        t.to_city_id::text,
        t.departure_at,
        t.arrival_at,
        v.name as vehicle_name,
        t.status::text,
        t.base_price::float8,
        t.policy_snapshot,
        t.created_at,
        t.updated_at
      from trips t
      left join vehicles v on v.id = t.vehicle_id
      order by t.departure_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.trips, query);
  }

  async trip(id: string) {
    const rows = await this.rows(
      `
        select
          t.id::text,
          t.route_id::text,
          t.company_id::text,
          t.vehicle_id::text,
          t.from_city_id::text,
          t.to_city_id::text,
          t.departure_at,
          t.arrival_at,
          v.name as vehicle_name,
          t.status::text,
          t.base_price::float8,
          t.policy_snapshot,
          t.created_at,
          t.updated_at
        from trips t
        left join vehicles v on v.id = t.vehicle_id
        where t.id = $1::uuid
      `,
      [id],
    );

    if (rows?.[0]) {
      return rows[0];
    }

    const trip = this.db.trips.find((item) => item.id === id);
    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }
    return trip;
  }

  async tripStatus(id: string, status: 'cancelled') {
    const trip = await this.trip(id);
    trip.status = status;
    this.invalidateAdminCache();
    return trip;
  }

  async busCompanies() {
    const rows = await this.rows(`
      select id::text, partner_organization_id::text, name, status,
             rating_average::float8, reviews_count, created_at, updated_at
      from bus_companies
      order by created_at desc
    `);
    return rows ?? this.db.busCompanies;
  }

  busCompanyStatus(id: string, body: Record<string, unknown>) {
    return {
      id,
      status: String(body.status ?? 'active'),
      updated_at: this.db.now(),
    };
  }

  async bookings(query: QueryLike = {}) {
    const rows = await this.rows(
      `${this.dbBookingsSql()} ${this.limitClause(query)}`,
    );
    return rows ?? this.paginateAdmin(this.db.bookings, query);
  }

  async booking(id: string) {
    const rows = await this.rows(this.dbBookingsSql('where b.id = $1::uuid'), [
      id,
    ]);

    if (rows?.[0]) {
      return rows[0];
    }

    const booking = this.db.findBooking(id);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }
    return booking;
  }

  async bookingCancel(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const booking = await this.booking(id);
    booking.status = BookingStatus.CANCELLED;
    booking.cancelled_at = this.db.now();
    booking.cancel_reason_text = String(body.reason ?? 'Admin cancel');
    this.db.audit('booking.admin_cancel', actor, { booking_id: id });
    this.invalidateAdminCache();
    return booking;
  }

  async bookingStatusAction(id: string, body: Record<string, unknown>) {
    const booking = await this.booking(id);
    const action = String(body.action ?? '');
    if (action === 'confirm') {
      booking.status = BookingStatus.CONFIRMED;
    }
    if (action === 'complete') {
      booking.status = BookingStatus.COMPLETED;
    }
    booking.updated_at = this.db.now();
    this.invalidateAdminCache();
    return booking;
  }

  async payments(query: QueryLike = {}) {
    const rows = await this.rows(`
      select id::text, booking_id::text, provider::text, status::text,
             amount::float8, currency, payment_url, provider_reference,
             idempotency_key, created_at, updated_at
      from payments
      order by created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.payments, query);
  }

  async payment(id: string) {
    const rows = await this.rows(
      `
        select id::text, booking_id::text, provider::text, status::text,
               amount::float8, currency, payment_url, provider_reference,
               idempotency_key, created_at, updated_at
        from payments
        where id = $1::uuid
      `,
      [id],
    );
    return (
      rows?.[0] ??
      this.db.payments.find((payment) => payment.id === id) ?? {
        id,
        status: 'not_found',
      }
    );
  }

  paymentReconcile(id: string) {
    return { payment_id: id, reconciled: true, checked_at: this.db.now() };
  }

  async refunds(query: QueryLike = {}) {
    const rows = await this.rows(`
      select id::text, booking_id::text, user_id::text, status::text,
             requested_amount::float8, approved_amount::float8,
             currency, reason, created_at, updated_at
      from refunds
      order by created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.refunds, query);
  }

  async refund(id: string) {
    const rows = await this.rows(
      `
        select id::text, booking_id::text, user_id::text, status::text,
               requested_amount::float8, approved_amount::float8,
               currency, reason, created_at, updated_at
        from refunds
        where id = $1::uuid
      `,
      [id],
    );
    return (
      rows?.[0] ??
      this.db.refunds.find((refund) => refund['id'] === id) ?? { id }
    );
  }

  async refundStatus(id: string, status: string) {
    const refund = await this.refund(id);
    refund['status'] = status;
    refund['updated_at'] = this.db.now();
    this.invalidateAdminCache();
    return refund;
  }

  async financeOverview() {
    const rows = await this.rows(`
      select
        coalesce((select sum(total_amount) from bookings), 0)::float8 as gross_amount,
        coalesce((select sum(amount) from payments where status = 'paid'), 0)::float8 as paid_amount,
        'UZS' as currency
    `);

    if (rows?.[0]) {
      return rows[0];
    }

    const gross = this.db.bookings.reduce(
      (sum, booking) => sum + booking.total_amount,
      0,
    );
    return {
      gross_amount: gross,
      paid_amount: this.db.payments
        .filter((payment) => payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0),
      currency: 'UZS',
    };
  }

  async partnersReport() {
    const rows = await this.rows(`
      select
        po.id::text as partner_id,
        po.brand_name,
        count(b.id)::int as bookings,
        coalesce(sum(b.total_amount), 0)::float8 as total_revenue,
        coalesce(sum(b.commission_amount), 0)::float8 as total_commission
      from partner_organizations po
      left join bookings b on b.partner_organization_id = po.id
      group by po.id
      order by total_revenue desc
    `);

    return (
      rows ??
      this.db.partnerOrganizations.map((partner) => ({
        partner_id: partner.id,
        brand_name: partner.brand_name,
        bookings: this.db.bookings.filter(
          (booking) => booking.partner_organization_id === partner.id,
        ).length,
      }))
    );
  }

  async providerReconciliation() {
    const rows = await this.rows(`
      select id::text as payment_id, provider::text, status::text, true as matched
      from payments
      order by created_at desc
    `);
    return (
      rows ??
      this.db.payments.map((payment) => ({
        payment_id: payment.id,
        provider: payment.provider,
        status: payment.status,
        matched: true,
      }))
    );
  }

  financeDocuments() {
    return [];
  }

  financeDocumentRegenerate(id: string) {
    return { id, regenerated: true, created_at: this.db.now() };
  }

  async withdrawals(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        wr.id::text,
        wr.organization_id::text as partner_id,
        po.brand_name as partner_name,
        wr.amount::float8,
        wr.currency,
        wr.status,
        wr.created_at as request_date,
        wr.created_at,
        wr.updated_at,
        coalesce(po.tax_id, po.id::text) as bank_account
      from withdrawal_requests wr
      left join partner_organizations po on po.id = wr.organization_id
      order by wr.created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin([], query);
  }

  async withdrawal(id: string) {
    const rows = await this.rows(
      `
        select
          wr.id::text,
          wr.organization_id::text as partner_id,
          po.brand_name as partner_name,
          wr.amount::float8,
          wr.currency,
          wr.status,
          wr.created_at as request_date,
          wr.created_at,
          wr.updated_at,
          coalesce(po.tax_id, po.id::text) as bank_account
        from withdrawal_requests wr
        left join partner_organizations po on po.id = wr.organization_id
        where wr.id = $1::uuid
      `,
      [id],
    );
    return rows?.[0] ?? { id, status: 'requested' };
  }

  async withdrawalStatus(id: string, status: string) {
    const nextStatus = normalizeWithdrawalStatus(status);
    if (isUuid(id)) {
      const rows = await this.rows(
        `
          update withdrawal_requests wr
          set status = $2,
              updated_at = now()
          from partner_organizations po
          where wr.id = $1::uuid
            and po.id = wr.organization_id
          returning
            wr.id::text,
            wr.organization_id::text as partner_id,
            po.brand_name as partner_name,
            wr.amount::float8,
            wr.currency,
            wr.status,
            wr.created_at as request_date,
            wr.created_at,
            wr.updated_at,
            coalesce(po.tax_id, po.id::text) as bank_account
        `,
        [id, nextStatus],
      );
      if (rows?.[0]) {
        this.invalidateAdminCache();
        return rows[0];
      }
    }

    this.invalidateAdminCache();
    return { id, status: nextStatus, updated_at: this.db.now() };
  }

  async cmsList(resource: string, query: QueryLike = {}) {
    const types = cmsTypesForResource(resource);
    const rows = await this.rows(
      `
        select
          id::text,
          type,
          slug,
          coalesce(title ->> 'uz', slug, type) as title,
          coalesce(body ->> 'uz', '') as body,
          status,
          metadata,
          metadata ->> 'imageUrl' as image_url,
          metadata ->> 'link' as link,
          coalesce((metadata ->> 'order')::int, 0) as "order",
          published_at,
          created_at,
          updated_at
        from cms_entries
        where type = any($1::text[])
        order by coalesce((metadata ->> 'order')::int, 9999), created_at desc
        ${this.limitClause(query)}
      `,
      [types],
    );
    return rows ?? this.paginateAdmin(this.cmsStore[resource] ?? [], query);
  }

  cmsCreate(resource: string, body: Record<string, unknown>) {
    const item = {
      id: this.db.id(resource),
      ...body,
      status: 'draft',
      created_at: this.db.now(),
    };
    this.cmsStore[resource] = this.cmsStore[resource] ?? [];
    this.cmsStore[resource].unshift(item);
    void this.cache.delByPattern('cms:*');
    this.invalidateAdminCache();
    return item;
  }

  cmsUpdate(resource: string, id: string, body: Record<string, unknown>) {
    void this.cache.delByPattern('cms:*');
    this.invalidateAdminCache();
    return { id, resource, ...body, updated_at: this.db.now() };
  }

  cmsAction(resource: string, id: string, action: string) {
    void this.cache.delByPattern('cms:*');
    this.invalidateAdminCache();
    return { id, resource, action, processed_at: this.db.now() };
  }

  cmsTranslation(resource: string, id: string, body: Record<string, unknown>) {
    return { id, resource, translations: body, updated_at: this.db.now() };
  }

  async promos(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        id::text,
        coalesce(title ->> 'uz', upper(slug), 'PROMO') as code,
        metadata ->> 'discountType' as discount_type,
        coalesce((metadata ->> 'discountValue')::float8, 0) as discount_value,
        coalesce((metadata ->> 'usageLimit')::int, 0) as usage_limit,
        coalesce((metadata ->> 'usedCount')::int, 0) as used_count,
        coalesce(published_at, created_at + interval '30 days') as valid_until,
        status,
        created_at,
        updated_at
      from cms_entries
      where type = 'promo'
      order by created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.promosStore, query);
  }

  promoCreate(body: Record<string, unknown>) {
    const promo = {
      id: this.db.id('promo'),
      code: String(body.code ?? 'UZBRON10').toUpperCase(),
      status: 'active',
      created_at: this.db.now(),
    };
    this.promosStore.unshift(promo);
    void this.cache.delByPattern('cms:*');
    this.invalidateAdminCache();
    return promo;
  }

  promoStats(id: string) {
    return { id, usages: 0, revenue: 0 };
  }

  async supportTickets(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        st.id::text,
        st.user_id::text,
        st.subject,
        st.priority,
        st.status,
        concat_ws(' ', u.first_name, u.last_name) as customer_name,
        'user' as customer_type,
        st.created_at,
        st.updated_at
      from support_tickets st
      left join users u on u.id = st.user_id
      order by st.created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.supportTickets, query);
  }

  async supportTicket(id: string) {
    if (!isUuid(id)) {
      return (
        this.db.supportTickets.find((ticket) => ticket['id'] === id) ?? { id }
      );
    }

    const rows = await this.rows(
      `
        select
          st.id::text,
          st.user_id::text,
          st.subject,
          st.priority,
          st.status,
          concat_ws(' ', u.first_name, u.last_name) as customer_name,
          'user' as customer_type,
          st.created_at,
          st.updated_at
        from support_tickets st
        left join users u on u.id = st.user_id
        where st.id = $1::uuid
      `,
      [id],
    );
    const messages = await this.rows(
      `
        select
          sm.id::text,
          sm.ticket_id::text,
          sm.sender_type,
          sm.sender_id::text,
          case
            when sm.sender_type = 'admin' then coalesce(au.full_name, 'Admin')
            else concat_ws(' ', u.first_name, u.last_name)
          end as sender_name,
          sm.body as message,
          sm.created_at
        from support_messages sm
        left join users u on u.id = sm.sender_id
        left join admin_users au on au.id = sm.sender_id
        where sm.ticket_id = $1::uuid
        order by sm.created_at asc
      `,
      [id],
    );

    return (
      (rows?.[0] ? { ...rows[0], messages: messages ?? [] } : undefined) ??
      this.db.supportTickets.find((ticket) => ticket['id'] === id) ?? { id }
    );
  }

  async supportStatus(id: string, body: Record<string, unknown>) {
    const status = normalizeSupportStatus(body.status ?? body.action);
    if (isUuid(id)) {
      const rows = await this.rows(
        `
          update support_tickets
          set status = $2,
              updated_at = now()
          where id = $1::uuid
          returning
            id::text,
            user_id::text,
            subject,
            priority,
            status,
            created_at,
            updated_at
        `,
        [id, status],
      );
      if (rows?.[0]) {
        this.invalidateAdminCache();
        return rows[0];
      }
    }

    const ticket = this.db.supportTickets.find((item) => item['id'] === id);
    if (!ticket) {
      throw new NotFoundException({
        code: 'SUPPORT_TICKET_NOT_FOUND',
        message: 'Murojaat topilmadi',
      });
    }
    ticket['status'] = status;
    ticket['updated_at'] = this.db.now();
    this.invalidateAdminCache();
    return ticket;
  }

  async supportMessage(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const message = String(body.message ?? body.body ?? '').trim();
    if (isUuid(id)) {
      const rows = await this.rows(
        `
          insert into support_messages (ticket_id, sender_type, sender_id, body)
          values ($1::uuid, 'admin', $2::uuid, $3)
          returning
            id::text,
            ticket_id::text,
            sender_type,
            sender_id::text,
            'Admin' as sender_name,
            body as message,
            created_at
        `,
        [id, adminActorUuid(actor), message],
      );
      if (rows?.[0]) {
        await this.supportStatus(id, { status: 'in_progress' });
        return rows[0];
      }
    }

    const ticket = this.db.supportTickets.find((item) => item['id'] === id);
    if (!ticket) {
      throw new NotFoundException({
        code: 'SUPPORT_TICKET_NOT_FOUND',
        message: 'Murojaat topilmadi',
      });
    }

    const currentActor = this.db.actorOrDemo(actor);
    const row = {
      id: this.db.id('support_msg'),
      ticket_id: id,
      sender_type: 'admin',
      sender_id: currentActor.id,
      sender_name: 'Admin',
      message,
      body: message,
      created_at: this.db.now(),
    };
    this.db.supportMessages.push(row);
    ticket['status'] = 'in_progress';
    ticket['updated_at'] = this.db.now();
    return row;
  }

  async supportAction(
    actor: RequestActor | undefined,
    id: string,
    action: string,
    body: Record<string, unknown>,
  ) {
    if (action === 'close') {
      return this.supportStatus(id, { status: 'closed' });
    }
    if (action === 'reopen') {
      return this.supportStatus(id, { status: 'open' });
    }
    if (action === 'status') {
      return this.supportStatus(id, body);
    }
    if (action === 'message' || action === 'reply') {
      return this.supportMessage(actor, id, body);
    }
    return { id, action, body, updated_at: this.db.now() };
  }

  async supportStats() {
    const rows = await this.rows(`
      select
        count(*) filter (where status = 'open')::int as open,
        count(*) filter (where status = 'closed')::int as closed
      from support_tickets
    `);
    return rows?.[0] ?? { open: this.db.supportTickets.length, closed: 0 };
  }

  notificationBroadcastCreate(body: Record<string, unknown>) {
    const broadcast = {
      id: this.db.id('broadcast'),
      ...body,
      status: 'draft',
      created_at: this.db.now(),
    };
    this.broadcastsStore.unshift(broadcast);
    return broadcast;
  }

  notificationBroadcasts(query: QueryLike = {}) {
    return this.paginateAdmin(this.broadcastsStore, query);
  }

  notificationBroadcastOne(id: string) {
    return (
      this.broadcastsStore.find((broadcast) => broadcast['id'] === id) ?? { id }
    );
  }

  notificationBroadcastAction(id: string, action: string) {
    return { id, action, updated_at: this.db.now() };
  }

  async adminUsers(query: QueryLike = {}) {
    const rows = await this.rows(`
      select id::text, email, full_name, role, status, created_at, updated_at
      from admin_users
      where deleted_at is null
      order by created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.adminUsersStore, query);
  }

  adminUserCreate(body: Record<string, unknown>) {
    const user = {
      id: this.db.id('admin'),
      email: String(body.email ?? '').toLowerCase(),
      role: String(body.role ?? 'moderator'),
      status: 'active',
      created_at: this.db.now(),
    };
    this.adminUsersStore.unshift(user);
    this.invalidateAdminCache();
    return user;
  }

  adminUserUpdate(id: string, body: Record<string, unknown>) {
    this.invalidateAdminCache();
    return { id, ...body, updated_at: this.db.now() };
  }

  adminUserStatus(id: string, body: Record<string, unknown>) {
    this.invalidateAdminCache();
    return {
      id,
      status: String(body.status ?? 'active'),
      updated_at: this.db.now(),
    };
  }

  adminUserReset2fa(id: string) {
    return { id, two_factor_reset: true };
  }

  roles() {
    return [
      { id: 'super_admin', permissions: ['*'] },
      { id: 'moderator', permissions: ['partner.approve', 'hotel.publish'] },
      {
        id: 'finance_admin',
        permissions: ['finance.refund', 'withdrawal.approve'],
      },
    ];
  }

  rolePermissions(id: string, body: Record<string, unknown>) {
    return {
      id,
      permissions: body.permissions ?? [],
      updated_at: this.db.now(),
    };
  }

  async auditLogs(query: QueryLike = {}) {
    const rows = await this.rows(`
      select
        id::text,
        actor_type,
        actor_id::text,
        action,
        entity_type,
        entity_id::text,
        old_value,
        new_value,
        coalesce(metadata, '{}'::jsonb) ||
          jsonb_build_object('target', concat_ws(':', entity_type, entity_id::text)) as metadata,
        ip_address,
        user_agent,
        request_id,
        created_at
      from audit_logs
      order by created_at desc
      ${this.limitClause(query)}
    `);
    return rows ?? this.paginateAdmin(this.db.auditLogs, query);
  }

  settings() {
    return this.cache.getOrSet('admin:settings', 300, () => ({
      general: { app_name: 'UzBron', timezone: 'Asia/Tashkent' },
      security: { admin_2fa_required: true },
      booking: { hold_minutes: 15 },
      providers: { click: { enabled: true }, payme: { enabled: true } },
    }));
  }

  settingsGroup(group: string, body: Record<string, unknown>) {
    this.invalidateAdminCache();
    return { group, ...body, updated_at: this.db.now() };
  }

  providerSettings(provider: string, body: Record<string, unknown>) {
    this.invalidateAdminCache();
    return {
      provider,
      ...body,
      updated_at: this.db.now(),
      secrets_masked: true,
    };
  }

  providerTest(provider: string) {
    return { provider, ok: true, checked_at: this.db.now() };
  }
}
