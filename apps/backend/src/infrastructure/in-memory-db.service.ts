import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BookingStatus, Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { inMemoryDataEnabled } from '../auth/security';

export type Language = 'uz' | 'ru' | 'en';
export type MoneyCurrency = 'UZS';
export type BookingType = 'hotel' | 'bus';
export type PaymentMethod = 'click' | 'payme' | 'uzcard' | 'humo' | 'cash';
export type ConfirmationMode = 'instant_confirmation' | 'request_confirmation';
export type PaymentStatus =
  | 'pending'
  | 'awaiting_cash'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface UserRecord {
  id: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status: 'unverified' | 'active' | 'blocked' | 'deleted';
  preferred_language: Language;
  bonus_balance: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerOrganizationRecord {
  id: string;
  type: 'hotel' | 'bus' | 'mixed';
  legal_name: string;
  brand_name: string;
  phone: string;
  email: string;
  city_id: string;
  address: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'more_information_required'
    | 'approved'
    | 'suspended'
    | 'rejected'
    | 'blocked';
  default_commission_rate: number;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerUserRecord {
  id: string;
  organization_id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  status: 'active' | 'invited' | 'blocked' | 'deleted';
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  full_name?: string;
  role: Role;
  roles: Role[];
  status: 'active' | 'blocked' | 'deleted';
  totp_secret?: string;
  recovery_code_hashes?: string[];
  created_at: string;
  updated_at: string;
}

export interface HotelRecord {
  id: string;
  partner_organization_id: string;
  slug: string;
  city_id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  address: string;
  latitude: number;
  longitude: number;
  stars: number;
  rating_average: number;
  reviews_count: number;
  status: 'draft' | 'pending_review' | 'published' | 'hidden' | 'rejected';
  amenities: string[];
  images: string[];
  check_in_time: string;
  check_out_time: string;
}

export interface HotelRoomRecord {
  id: string;
  hotel_id: string;
  room_type_id: string;
  code: string;
  name: Record<Language, string>;
  base_occupancy: number;
  max_adults: number;
  max_children: number;
  total_inventory: number;
  base_price: number;
  status: 'active' | 'inactive';
}

export interface TripRecord {
  id: string;
  route_id: string;
  company_id: string;
  from_city_id: string;
  to_city_id: string;
  departure_at: string;
  arrival_at: string;
  vehicle_name: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  base_price: number;
}

export interface TripSeatRecord {
  id: string;
  trip_id: string;
  seat_code: string;
  seat_class: 'standard' | 'comfort' | 'vip';
  price: number;
  status: 'available' | 'held' | 'booked' | 'blocked';
  held_by_booking_id?: string;
  held_until?: string;
}

export interface BookingRecord {
  id: string;
  booking_number: string;
  user_id: string;
  partner_organization_id: string;
  type: BookingType;
  confirmation_mode: ConfirmationMode;
  payment_method: PaymentMethod;
  status: BookingStatus;
  currency: MoneyCurrency;
  subtotal: number;
  discount_amount: number;
  bonus_amount: number;
  service_fee: number;
  total_amount: number;
  commission_amount: number;
  partner_payable: number;
  partner_confirmation_deadline?: string;
  expires_at?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancel_reason_text?: string;
  item: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  provider: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: MoneyCurrency;
  payment_url?: string;
  provider_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentEventRecord {
  id: string;
  provider: string;
  event_key: string;
  event_type: string;
  payload_hash: string;
  booking_id?: string;
  payment_id?: string;
  processed_at: string;
}

export interface ExportJobRecord {
  id: string;
  owner_id: string;
  type: string;
  format: 'csv' | 'xlsx' | 'pdf';
  status: 'queued' | 'processing' | 'ready' | 'failed' | 'deleted';
  download_url?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class InMemoryDbService {
  readonly regions = [
    {
      id: 'region-tashkent',
      name: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    },
    {
      id: 'region-samarkand',
      name: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' },
    },
  ];

  readonly cities = [
    {
      id: 'city-tashkent',
      region_id: 'region-tashkent',
      name: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    },
    {
      id: 'city-samarkand',
      region_id: 'region-samarkand',
      name: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' },
    },
    {
      id: 'city-bukhara',
      region_id: 'region-samarkand',
      name: { uz: 'Buxoro', ru: 'Бухара', en: 'Bukhara' },
    },
  ];

  readonly amenities = [
    { id: 'wifi', name: { uz: 'Wi-Fi', ru: 'Wi-Fi', en: 'Wi-Fi' } },
    {
      id: 'parking',
      name: { uz: 'Avtoturargoh', ru: 'Парковка', en: 'Parking' },
    },
    { id: 'pool', name: { uz: 'Basseyn', ru: 'Бассейн', en: 'Pool' } },
  ];

  readonly roomTypes = [
    {
      id: 'standard',
      name: { uz: 'Standart', ru: 'Стандарт', en: 'Standard' },
    },
    { id: 'family', name: { uz: 'Oilaviy', ru: 'Семейный', en: 'Family' } },
  ];

  readonly busTypes = [
    {
      id: 'standard-bus',
      name: { uz: 'Standart', ru: 'Стандарт', en: 'Standard' },
    },
    {
      id: 'comfort-bus',
      name: { uz: 'Comfort', ru: 'Комфорт', en: 'Comfort' },
    },
  ];

  readonly cancellationPolicies = [
    {
      id: 'flexible',
      name: { uz: 'Moslashuvchan', ru: 'Гибкий', en: 'Flexible' },
      refundable_until_hours: 24,
    },
  ];

  readonly users: UserRecord[] = [
    {
      id: 'demo-user-id',
      phone: '+998901234567',
      first_name: 'Demo',
      last_name: 'User',
      email: 'user@uzbron.uz',
      status: 'active',
      preferred_language: 'uz',
      bonus_balance: 250000,
      created_at: this.now(),
      updated_at: this.now(),
    },
  ];

  readonly partnerOrganizations: PartnerOrganizationRecord[] = [
    {
      id: 'demo-partner-org-id',
      type: 'mixed',
      legal_name: 'UzBron Demo Partner LLC',
      brand_name: 'UzBron Demo Partner',
      phone: '+998901112233',
      email: 'partner@uzbron.uz',
      city_id: 'city-samarkand',
      address: 'Samarqand, Registon maydoni',
      status: 'approved',
      default_commission_rate: 12,
      created_at: this.now(),
      updated_at: this.now(),
    },
  ];

  readonly partnerUsers: PartnerUserRecord[] = [
    {
      id: 'demo-partner-user-id',
      organization_id: 'demo-partner-org-id',
      email: 'partner@uzbron.uz',
      password_hash:
        '$argon2id$v=19$m=65536,t=3,p=4$Aol2VmKu0hxEbDZxxCP1wg$AQu6m+LFd2KuTND4KPY98nhpRUV9SyU+lrBdDzFpr6c',
      full_name: 'Demo Partner',
      status: 'active',
      role: 'owner',
      created_at: this.now(),
      updated_at: this.now(),
    },
  ];

  readonly adminUsers: AdminUserRecord[] = [
    {
      id: 'demo-admin-id',
      email: 'admin@uzbron.uz',
      username: 'admin',
      password_hash:
        '$argon2id$v=19$m=65536,t=3,p=4$Ew1E5R0QIy52QBsBY9rSFA$AokIMmdK2yGytTgwq1I4iKXrgkWxNWRTAS5NhSmRkxY',
      full_name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      roles: [Role.SUPER_ADMIN],
      status: 'active',
      created_at: this.now(),
      updated_at: this.now(),
    },
  ];

  readonly hotels: HotelRecord[] = [
    {
      id: 'hotel-samarkand-plaza',
      partner_organization_id: 'demo-partner-org-id',
      slug: 'samarkand-plaza',
      city_id: 'city-samarkand',
      name: {
        uz: 'Samarkand Plaza',
        ru: 'Samarkand Plaza',
        en: 'Samarkand Plaza',
      },
      description: {
        uz: 'Registon yaqinidagi biznes hotel.',
        ru: 'Бизнес-отель рядом с Регистаном.',
        en: 'Business hotel near Registan.',
      },
      address: 'Samarqand, Universitet xiyoboni 10',
      latitude: 39.6542,
      longitude: 66.9597,
      stars: 4,
      rating_average: 4.7,
      reviews_count: 128,
      status: 'published',
      amenities: ['wifi', 'parking', 'pool'],
      images: ['/public/hotels/samarkand-plaza.jpg'],
      check_in_time: '14:00',
      check_out_time: '12:00',
    },
  ];

  readonly rooms: HotelRoomRecord[] = [
    {
      id: 'room-standard-1',
      hotel_id: 'hotel-samarkand-plaza',
      room_type_id: 'standard',
      code: 'STD',
      name: {
        uz: 'Standart xona',
        ru: 'Стандартный номер',
        en: 'Standard room',
      },
      base_occupancy: 2,
      max_adults: 2,
      max_children: 1,
      total_inventory: 8,
      base_price: 45000000,
      status: 'active',
    },
    {
      id: 'room-family-1',
      hotel_id: 'hotel-samarkand-plaza',
      room_type_id: 'family',
      code: 'FAM',
      name: { uz: 'Oilaviy xona', ru: 'Семейный номер', en: 'Family room' },
      base_occupancy: 4,
      max_adults: 4,
      max_children: 2,
      total_inventory: 4,
      base_price: 75000000,
      status: 'active',
    },
  ];

  readonly busRoutes = [
    {
      id: 'route-tashkent-samarkand',
      from_city_id: 'city-tashkent',
      to_city_id: 'city-samarkand',
      duration_minutes: 270,
    },
  ];

  readonly busCompanies = [
    {
      id: 'bus-company-uzbron',
      partner_organization_id: 'demo-partner-org-id',
      name: 'UzBron Express',
      rating_average: 4.6,
      reviews_count: 42,
    },
  ];

  readonly trips: TripRecord[] = [
    {
      id: 'trip-tashkent-samarkand-001',
      route_id: 'route-tashkent-samarkand',
      company_id: 'bus-company-uzbron',
      from_city_id: 'city-tashkent',
      to_city_id: 'city-samarkand',
      departure_at: '2026-07-01T04:00:00Z',
      arrival_at: '2026-07-01T08:30:00Z',
      vehicle_name: 'Yutong Comfort',
      status: 'scheduled',
      base_price: 12000000,
    },
  ];

  readonly tripSeats: TripSeatRecord[] = Array.from(
    { length: 12 },
    (_, index) => ({
      id: `seat-${index + 1}`,
      trip_id: 'trip-tashkent-samarkand-001',
      seat_code: `${index + 1}`,
      seat_class: index < 2 ? 'comfort' : 'standard',
      price: index < 2 ? 15000000 : 12000000,
      status: index === 11 ? 'blocked' : 'available',
    }),
  );

  readonly bookings: BookingRecord[] = [];
  readonly bookingStatusHistory: Array<Record<string, unknown>> = [];
  readonly bookingMessages: Array<Record<string, unknown>> = [];
  readonly payments: PaymentRecord[] = [];
  readonly paymentEvents: PaymentEventRecord[] = [];
  readonly refunds: Array<Record<string, unknown>> = [];
  readonly reviews: Array<Record<string, unknown>> = [];
  readonly supportTickets: Array<Record<string, unknown>> = [];
  readonly supportMessages: Array<Record<string, unknown>> = [];
  readonly notifications: Array<Record<string, unknown>> = [];
  readonly exportJobs: ExportJobRecord[] = [];
  readonly uploads: Array<Record<string, unknown>> = [];
  readonly auditLogs: Array<Record<string, unknown>> = [];
  readonly partnerApiKeys: Array<Record<string, unknown>> = [];
  readonly partnerWebhooks: Array<Record<string, unknown>> = [];

  now(): string {
    return new Date().toISOString();
  }

  id(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }

  bookingNumber(): string {
    return `UZB-${Date.now().toString().slice(-8)}`;
  }

  actorOrDemo(actor?: RequestActor): RequestActor {
    if (actor) {
      return actor;
    }

    if (!inMemoryDataEnabled()) {
      throw new Error('AUTH_REQUIRED');
    }

    return {
      id: 'demo-user-id',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
      sessionId: 'demo-session-id',
    };
  }

  audit(action: string, actor: RequestActor | undefined, metadata: unknown) {
    const currentActor = this.actorOrDemo(actor);
    const entry = {
      id: this.id('audit'),
      action,
      actor_id: currentActor.id,
      actor_type: currentActor.actorType,
      metadata,
      created_at: this.now(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  findUser(id: string): UserRecord | undefined {
    return this.users.find((user) => user.id === id);
  }

  findAdminByLogin(login: string): AdminUserRecord | undefined {
    const normalized = login.trim().toLowerCase();
    return this.adminUsers.find(
      (admin) =>
        admin.email.toLowerCase() === normalized ||
        admin.username.toLowerCase() === normalized,
    );
  }

  findPartnerUserByEmail(email: string): PartnerUserRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return this.partnerUsers.find(
      (partnerUser) => partnerUser.email.toLowerCase() === normalized,
    );
  }

  findBooking(id: string): BookingRecord | undefined {
    return this.bookings.find((booking) => booking.id === id);
  }

  findPaymentByBooking(bookingId: string): PaymentRecord | undefined {
    return this.payments.find((payment) => payment.booking_id === bookingId);
  }

  createPayment(
    booking: BookingRecord,
    provider: PaymentMethod = booking.payment_method,
  ): PaymentRecord {
    const existing = this.findPaymentByBooking(booking.id);
    if (existing) {
      return existing;
    }

    const status: PaymentStatus =
      provider === 'cash' ? 'awaiting_cash' : 'pending';
    const payment: PaymentRecord = {
      id: this.id('pay'),
      booking_id: booking.id,
      provider,
      status,
      amount: booking.total_amount,
      currency: 'UZS',
      payment_url:
        provider === 'cash'
          ? undefined
          : `https://pay.uzbron.uz/mock/${provider}/${booking.id}`,
      created_at: this.now(),
      updated_at: this.now(),
    };

    this.payments.unshift(payment);
    return payment;
  }
}
