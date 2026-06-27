import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

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

  constructor(private readonly db: InMemoryDbService) {}

  getOverview() {
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
  }

  chart(type: string) {
    return [{ date: new Date().toISOString().slice(0, 10), type, value: 0 }];
  }

  activity() {
    return this.db.auditLogs.slice(0, 20);
  }

  users() {
    return this.db.users;
  }

  user(id: string) {
    const user = this.db.findUser(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_BLOCKED',
        message: 'User topilmadi',
      });
    }
    return user;
  }

  userStatus(id: string, body: Record<string, unknown>) {
    const user = this.user(id);
    user.status = String(body.status ?? 'active') as typeof user.status;
    user.updated_at = this.db.now();
    return user;
  }

  bonusAdjustment(id: string, body: Record<string, unknown>) {
    const user = this.user(id);
    const amount = Number(body.amount ?? 0);
    user.bonus_balance += amount;
    return { user_id: id, amount, balance: user.bonus_balance };
  }

  userBookings(id: string) {
    return this.db.bookings.filter((booking) => booking.user_id === id);
  }

  userAudit(id: string) {
    return this.db.auditLogs.filter((log) => log['actor_id'] === id);
  }

  userMessage(id: string, body: Record<string, unknown>) {
    const notification = {
      id: this.db.id('notification'),
      owner_id: id,
      title: String(body.title ?? 'Admin xabari'),
      body: String(body.body ?? ''),
      created_at: this.db.now(),
    };
    this.db.notifications.unshift(notification);
    return notification;
  }

  exportJob(
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
    return job;
  }

  partners() {
    return this.db.partnerOrganizations;
  }

  partnerRequests() {
    return this.db.partnerOrganizations.filter(
      (partner) => partner.status !== 'approved',
    );
  }

  partner(id: string) {
    const partner = this.db.partnerOrganizations.find((item) => item.id === id);
    if (!partner) {
      throw new NotFoundException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Partner topilmadi',
      });
    }
    return partner;
  }

  partnerDecision(
    actor: RequestActor | undefined,
    id: string,
    status: 'approved' | 'rejected' | 'more_information_required',
    body: Record<string, unknown> = {},
  ) {
    const partner = this.partner(id);
    partner.status = status;
    partner.updated_at = this.db.now();
    partner.rejection_reason = body.reason ? String(body.reason) : undefined;
    this.db.audit('partner.moderation', actor, { partner_id: id, status });
    return partner;
  }

  partnerStatus(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const partner = this.partner(id);
    partner.status = String(
      body.status ?? partner.status,
    ) as typeof partner.status;
    partner.updated_at = this.db.now();
    this.db.audit('partner.status', actor, {
      partner_id: id,
      status: partner.status,
    });
    return partner;
  }

  partnerCommission(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const partner = this.partner(id);
    partner.default_commission_rate = Number(
      body.rate ?? body.default_commission_rate ?? 12,
    );
    partner.updated_at = this.db.now();
    this.db.audit('partner.commission', actor, {
      partner_id: id,
      rate: partner.default_commission_rate,
    });
    return partner;
  }

  partnerLedger(id: string) {
    return this.db.bookings
      .filter((booking) => booking.partner_organization_id === id)
      .map((booking) => ({
        id: this.db.id('ledger'),
        booking_id: booking.id,
        amount: booking.partner_payable,
        currency: booking.currency,
      }));
  }

  partnerAdjustment(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.partner(id);
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

  hotels() {
    return this.db.hotels;
  }

  hotel(id: string) {
    const hotel = this.db.hotels.find((item) => item.id === id);
    if (!hotel) {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }
    return hotel;
  }

  hotelStatus(id: string, status: 'published' | 'hidden' | 'rejected') {
    const hotel = this.hotel(id);
    hotel.status = status;
    return hotel;
  }

  trips() {
    return this.db.trips;
  }

  trip(id: string) {
    const trip = this.db.trips.find((item) => item.id === id);
    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }
    return trip;
  }

  tripStatus(id: string, status: 'cancelled') {
    const trip = this.trip(id);
    trip.status = status;
    return trip;
  }

  busCompanies() {
    return this.db.busCompanies;
  }

  busCompanyStatus(id: string, body: Record<string, unknown>) {
    return {
      id,
      status: String(body.status ?? 'active'),
      updated_at: this.db.now(),
    };
  }

  bookings() {
    return this.db.bookings;
  }

  booking(id: string) {
    const booking = this.db.findBooking(id);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }
    return booking;
  }

  bookingCancel(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const booking = this.booking(id);
    booking.status = BookingStatus.CANCELLED;
    booking.cancelled_at = this.db.now();
    booking.cancel_reason_text = String(body.reason ?? 'Admin cancel');
    this.db.audit('booking.admin_cancel', actor, { booking_id: id });
    return booking;
  }

  bookingStatusAction(id: string, body: Record<string, unknown>) {
    const booking = this.booking(id);
    const action = String(body.action ?? '');
    if (action === 'confirm') {
      booking.status = BookingStatus.CONFIRMED;
    }
    if (action === 'complete') {
      booking.status = BookingStatus.COMPLETED;
    }
    booking.updated_at = this.db.now();
    return booking;
  }

  payments() {
    return this.db.payments;
  }

  payment(id: string) {
    return (
      this.db.payments.find((payment) => payment.id === id) ?? {
        id,
        status: 'not_found',
      }
    );
  }

  paymentReconcile(id: string) {
    return { payment_id: id, reconciled: true, checked_at: this.db.now() };
  }

  refunds() {
    return this.db.refunds;
  }

  refund(id: string) {
    return this.db.refunds.find((refund) => refund['id'] === id) ?? { id };
  }

  refundStatus(id: string, status: string) {
    const refund = this.refund(id);
    refund['status'] = status;
    refund['updated_at'] = this.db.now();
    return refund;
  }

  financeOverview() {
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

  partnersReport() {
    return this.db.partnerOrganizations.map((partner) => ({
      partner_id: partner.id,
      brand_name: partner.brand_name,
      bookings: this.db.bookings.filter(
        (booking) => booking.partner_organization_id === partner.id,
      ).length,
    }));
  }

  providerReconciliation() {
    return this.db.payments.map((payment) => ({
      payment_id: payment.id,
      provider: payment.provider,
      status: payment.status,
      matched: true,
    }));
  }

  financeDocuments() {
    return [];
  }

  financeDocumentRegenerate(id: string) {
    return { id, regenerated: true, created_at: this.db.now() };
  }

  withdrawals() {
    return [];
  }

  withdrawal(id: string) {
    return { id, status: 'requested' };
  }

  withdrawalStatus(id: string, status: string) {
    return { id, status, updated_at: this.db.now() };
  }

  cmsList(resource: string) {
    return this.cmsStore[resource] ?? [];
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
    return item;
  }

  cmsUpdate(resource: string, id: string, body: Record<string, unknown>) {
    return { id, resource, ...body, updated_at: this.db.now() };
  }

  cmsAction(resource: string, id: string, action: string) {
    return { id, resource, action, processed_at: this.db.now() };
  }

  cmsTranslation(resource: string, id: string, body: Record<string, unknown>) {
    return { id, resource, translations: body, updated_at: this.db.now() };
  }

  promos() {
    return this.promosStore;
  }

  promoCreate(body: Record<string, unknown>) {
    const promo = {
      id: this.db.id('promo'),
      code: String(body.code ?? 'UZBRON10').toUpperCase(),
      status: 'active',
      created_at: this.db.now(),
    };
    this.promosStore.unshift(promo);
    return promo;
  }

  promoStats(id: string) {
    return { id, usages: 0, revenue: 0 };
  }

  supportTickets() {
    return this.db.supportTickets;
  }

  supportTicket(id: string) {
    return (
      this.db.supportTickets.find((ticket) => ticket['id'] === id) ?? { id }
    );
  }

  supportAction(id: string, action: string, body: Record<string, unknown>) {
    return { id, action, body, updated_at: this.db.now() };
  }

  supportStats() {
    return { open: this.db.supportTickets.length, closed: 0 };
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

  notificationBroadcasts() {
    return this.broadcastsStore;
  }

  notificationBroadcastOne(id: string) {
    return (
      this.broadcastsStore.find((broadcast) => broadcast['id'] === id) ?? { id }
    );
  }

  notificationBroadcastAction(id: string, action: string) {
    return { id, action, updated_at: this.db.now() };
  }

  adminUsers() {
    return this.adminUsersStore;
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
    return user;
  }

  adminUserUpdate(id: string, body: Record<string, unknown>) {
    return { id, ...body, updated_at: this.db.now() };
  }

  adminUserStatus(id: string, body: Record<string, unknown>) {
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

  auditLogs() {
    return this.db.auditLogs;
  }

  settings() {
    return {
      general: { app_name: 'UzBron', timezone: 'Asia/Tashkent' },
      security: { admin_2fa_required: true },
      booking: { hold_minutes: 15 },
      providers: { click: { enabled: true }, payme: { enabled: true } },
    };
  }

  settingsGroup(group: string, body: Record<string, unknown>) {
    return { group, ...body, updated_at: this.db.now() };
  }

  providerSettings(provider: string, body: Record<string, unknown>) {
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
