import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

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

  constructor(private readonly db: InMemoryDbService) {}

  profile(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.assertOrganization(organizationId);
  }

  updateProfile(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const organization = this.profile(actor);
    organization.brand_name = body.brand_name
      ? String(body.brand_name)
      : organization.brand_name;
    organization.phone = body.phone ? String(body.phone) : organization.phone;
    organization.email = body.email
      ? String(body.email).toLowerCase()
      : organization.email;
    organization.address = body.address
      ? String(body.address)
      : organization.address;
    organization.updated_at = this.db.now();
    return organization;
  }

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
      id: this.db.id('partner_user'),
      organization_id: this.organizationId(actor),
      email: String(body.email ?? '').toLowerCase(),
      role: String(body.role ?? 'operator'),
      status: 'invited',
      created_at: this.db.now(),
    };
    this.teamMembers.unshift(member);
    return member;
  }

  updateTeamMember(id: string, body: Record<string, unknown>) {
    return {
      id,
      role: String(body.role ?? 'operator'),
      status: String(body.status ?? 'active'),
      updated_at: this.db.now(),
    };
  }

  deleteTeamMember(id: string) {
    return { id, deleted: true };
  }

  documents(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.documentsStore.filter(
      (document) => document['organization_id'] === organizationId,
    );
  }

  addDocument(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const document = {
      id: this.db.id('doc'),
      organization_id: this.organizationId(actor),
      type: String(body.type ?? 'license'),
      file_id: String(body.file_id ?? this.db.id('file')),
      status: 'uploaded',
      created_at: this.db.now(),
    };
    this.documentsStore.unshift(document);
    return document;
  }

  submitApplication(actor: RequestActor | undefined) {
    const organization = this.profile(actor);
    organization.status = 'submitted';
    organization.updated_at = this.db.now();
    return organization;
  }

  applicationStatus(actor: RequestActor | undefined) {
    const organization = this.profile(actor);
    return {
      organization_id: organization.id,
      status: organization.status,
      history: [],
    };
  }

  resubmitApplication(actor: RequestActor | undefined) {
    const organization = this.profile(actor);
    organization.status = 'submitted';
    organization.updated_at = this.db.now();
    return organization;
  }

  hotels(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.db.hotels.filter(
      (hotel) => hotel.partner_organization_id === organizationId,
    );
  }

  createHotel(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const hotel = {
      id: this.db.id('hotel'),
      partner_organization_id: this.organizationId(actor),
      slug: String(body.slug ?? `hotel-${Date.now()}`),
      city_id: String(body.city_id ?? 'city-samarkand'),
      name: {
        uz: String(body.name_uz ?? body.name ?? 'Yangi hotel'),
        ru: String(body.name_ru ?? body.name ?? 'Новый отель'),
        en: String(body.name_en ?? body.name ?? 'New hotel'),
      },
      description: { uz: '', ru: '', en: '' },
      address: String(body.address ?? ''),
      latitude: Number(body.latitude ?? 0),
      longitude: Number(body.longitude ?? 0),
      stars: Number(body.stars ?? 3),
      rating_average: 0,
      reviews_count: 0,
      status: 'draft' as const,
      amenities: [],
      images: [],
      check_in_time: '14:00',
      check_out_time: '12:00',
    };
    this.db.hotels.unshift(hotel);
    return hotel;
  }

  hotel(id: string) {
    return this.assertHotel(id);
  }

  updateHotel(id: string, body: Record<string, unknown>) {
    const hotel = this.assertHotel(id);
    hotel.address = body.address ? String(body.address) : hotel.address;
    hotel.stars = body.stars ? Number(body.stars) : hotel.stars;
    hotel.status = body.status
      ? (String(body.status) as typeof hotel.status)
      : hotel.status;
    return hotel;
  }

  submitHotelReview(id: string) {
    const hotel = this.assertHotel(id);
    hotel.status = 'pending_review';
    return hotel;
  }

  addHotelImage(id: string, body: Record<string, unknown>) {
    const hotel = this.assertHotel(id);
    const image = String(
      body.url ?? body.image_url ?? `/mock/${this.db.id('image')}`,
    );
    hotel.images.push(image);
    return { hotel_id: id, image_url: image };
  }

  deleteHotelImage(id: string, imageId: string) {
    this.assertHotel(id);
    return { hotel_id: id, image_id: imageId, deleted: true };
  }

  rooms(id: string) {
    this.assertHotel(id);
    return this.db.rooms.filter((room) => room.hotel_id === id);
  }

  createRoom(id: string, body: Record<string, unknown>) {
    this.assertHotel(id);
    const room = {
      id: this.db.id('room'),
      hotel_id: id,
      room_type_id: String(body.room_type_id ?? 'standard'),
      code: String(body.code ?? `R-${Date.now()}`),
      name: {
        uz: String(body.name_uz ?? body.name ?? 'Yangi xona'),
        ru: String(body.name_ru ?? body.name ?? 'Новый номер'),
        en: String(body.name_en ?? body.name ?? 'New room'),
      },
      base_occupancy: Number(body.base_occupancy ?? 2),
      max_adults: Number(body.max_adults ?? 2),
      max_children: Number(body.max_children ?? 1),
      total_inventory: Number(body.total_inventory ?? 1),
      base_price: Number(body.base_price ?? 30000000),
      status: 'active' as const,
    };
    this.db.rooms.unshift(room);
    return room;
  }

  updateRoom(id: string, roomId: string, body: Record<string, unknown>) {
    this.assertHotel(id);
    const room = this.db.rooms.find((item) => item.id === roomId);
    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Xona topilmadi',
      });
    }
    room.base_price = body.base_price
      ? Number(body.base_price)
      : room.base_price;
    room.total_inventory = body.total_inventory
      ? Number(body.total_inventory)
      : room.total_inventory;
    return room;
  }

  deleteRoom(id: string, roomId: string) {
    this.assertHotel(id);
    const room = this.db.rooms.find((item) => item.id === roomId);
    if (room) {
      room.status = 'inactive';
    }
    return { hotel_id: id, room_id: roomId, deleted: true };
  }

  inventory(id: string) {
    this.assertHotel(id);
    return this.rooms(id).map((room) => ({
      room_id: room.id,
      date: new Date().toISOString().slice(0, 10),
      total_count: room.total_inventory,
      held_count: 0,
      booked_count: 0,
      closed: false,
    }));
  }

  updateInventory(id: string, body: Record<string, unknown>) {
    this.assertHotel(id);
    return {
      hotel_id: id,
      updated: true,
      items: body.items ?? [],
    };
  }

  blackoutDates(id: string, body: Record<string, unknown>) {
    this.assertHotel(id);
    return {
      hotel_id: id,
      dates: body.dates ?? [],
      closed: true,
    };
  }

  vehicles() {
    return this.vehiclesStore;
  }

  createVehicle(body: Record<string, unknown>) {
    const vehicle = {
      id: this.db.id('vehicle'),
      name: String(body.name ?? 'Yutong'),
      plate_number: String(body.plate_number ?? ''),
      seats_count: Number(body.seats_count ?? 45),
      status: 'active',
    };
    this.vehiclesStore.unshift(vehicle);
    return vehicle;
  }

  updateVehicle(id: string, body: Record<string, unknown>) {
    return { id, ...body, updated_at: this.db.now() };
  }

  seatLayout(id: string, body: Record<string, unknown>) {
    return {
      vehicle_id: id,
      layout: body.layout ?? [],
      updated_at: this.db.now(),
    };
  }

  routes() {
    return this.db.busRoutes;
  }

  createRoute(body: Record<string, unknown>) {
    const route = {
      id: this.db.id('route'),
      from_city_id: String(body.from_city_id ?? 'city-tashkent'),
      to_city_id: String(body.to_city_id ?? 'city-samarkand'),
      duration_minutes: Number(body.duration_minutes ?? 270),
    };
    this.db.busRoutes.unshift(route);
    return route;
  }

  updateRoute(id: string, body: Record<string, unknown>) {
    return { id, ...body, updated_at: this.db.now() };
  }

  trips() {
    return this.db.trips;
  }

  createTrip(body: Record<string, unknown>) {
    const trip = {
      id: this.db.id('trip'),
      route_id: String(body.route_id ?? 'route-tashkent-samarkand'),
      company_id: 'bus-company-uzbron',
      from_city_id: String(body.from_city_id ?? 'city-tashkent'),
      to_city_id: String(body.to_city_id ?? 'city-samarkand'),
      departure_at: String(body.departure_at ?? new Date().toISOString()),
      arrival_at: String(
        body.arrival_at ?? new Date(Date.now() + 4 * 60 * 60_000).toISOString(),
      ),
      vehicle_name: String(body.vehicle_name ?? 'Yutong'),
      status: 'scheduled' as const,
      base_price: Number(body.base_price ?? 12000000),
    };
    this.db.trips.unshift(trip);
    return trip;
  }

  updateTrip(id: string, body: Record<string, unknown>) {
    const trip = this.db.trips.find((item) => item.id === id);
    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }
    trip.base_price = body.base_price
      ? Number(body.base_price)
      : trip.base_price;
    return trip;
  }

  cancelTrip(id: string) {
    const trip = this.db.trips.find((item) => item.id === id);
    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }
    trip.status = 'cancelled';
    return trip;
  }

  tripSeats(id: string) {
    return this.db.tripSeats.filter((seat) => seat.trip_id === id);
  }

  bookings(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.db.bookings.filter(
      (booking) => booking.partner_organization_id === organizationId,
    );
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

  bookingStatus(id: string, status: string) {
    const booking = this.booking(id);
    if (status === 'confirmed') {
      booking.status = BookingStatus.CONFIRMED;
      booking.confirmed_at = this.db.now();
    }
    if (status === 'completed') {
      booking.status = BookingStatus.COMPLETED;
    }
    booking.updated_at = this.db.now();
    return booking;
  }

  rejectBooking(id: string, body: Record<string, unknown>) {
    const booking = this.booking(id);
    booking.status = BookingStatus.CANCELLED;
    booking.cancel_reason_text = String(body.reason ?? 'Partner rad etdi');
    booking.cancelled_at = this.db.now();
    return booking;
  }

  cashStatus(id: string, status: 'collected' | 'reversed') {
    const payment = this.db.findPaymentByBooking(id);
    if (payment) {
      payment.status = status === 'collected' ? 'paid' : 'awaiting_cash';
      payment.updated_at = this.db.now();
    }
    return { booking_id: id, cash_status: status, payment };
  }

  financeOverview(actor: RequestActor | undefined) {
    const bookings = this.bookings(actor);
    const gross = bookings.reduce(
      (sum, booking) => sum + booking.total_amount,
      0,
    );
    return {
      gross_amount: gross,
      pending_balance: Math.round(gross * 0.88),
      available_balance: Math.round(gross * 0.7),
      currency: 'UZS',
    };
  }

  ledger(actor: RequestActor | undefined) {
    return this.bookings(actor).map((booking) => ({
      id: this.db.id('ledger'),
      booking_id: booking.id,
      amount: booking.partner_payable,
      currency: booking.currency,
      type: 'booking_payable',
      created_at: booking.created_at,
    }));
  }

  financeChart(actor: RequestActor | undefined) {
    const overview = this.financeOverview(actor);
    return [
      {
        date: new Date().toISOString().slice(0, 10),
        amount: overview.gross_amount,
      },
    ];
  }

  withdrawal(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const request = {
      id: this.db.id('withdrawal'),
      organization_id: this.organizationId(actor),
      amount: Number(body.amount ?? 0),
      currency: 'UZS',
      status: 'requested',
      created_at: this.db.now(),
    };
    this.withdrawalsStore.unshift(request);
    return request;
  }

  withdrawals(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.withdrawalsStore.filter(
      (withdrawal) => withdrawal['organization_id'] === organizationId,
    );
  }

  createExport(
    actor: RequestActor | undefined,
    type: string,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.db.actorOrDemo(actor);
    const format = ['csv', 'xlsx', 'pdf'].includes(String(body.format))
      ? (String(body.format) as 'csv' | 'xlsx' | 'pdf')
      : 'csv';
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

  apiKeys(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.db.partnerApiKeys.filter(
      (key) => key['organization_id'] === organizationId,
    );
  }

  createApiKey(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const secret = `uzb_${this.db.id('secret')}`;
    const apiKey = {
      id: this.db.id('api_key'),
      organization_id: this.organizationId(actor),
      name: String(body.name ?? 'Default API key'),
      key_prefix: secret.slice(0, 12),
      scopes: Array.isArray(body.scopes) ? body.scopes : ['bookings:read'],
      status: 'active',
      created_at: this.db.now(),
      secret,
    };
    this.db.partnerApiKeys.unshift(apiKey);
    return apiKey;
  }

  revokeApiKey(id: string) {
    return { id, revoked_at: this.db.now() };
  }

  webhooks(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    return this.db.partnerWebhooks.filter(
      (webhook) => webhook['organization_id'] === organizationId,
    );
  }

  createWebhook(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const webhook = {
      id: this.db.id('webhook'),
      organization_id: this.organizationId(actor),
      url: String(body.url ?? ''),
      events: Array.isArray(body.events) ? body.events : ['booking.created'],
      status: 'active',
      created_at: this.db.now(),
    };
    this.db.partnerWebhooks.unshift(webhook);
    return webhook;
  }

  updateWebhook(id: string, body: Record<string, unknown>) {
    return { id, ...body, updated_at: this.db.now() };
  }

  deleteWebhook(id: string) {
    return { id, deleted: true };
  }

  testWebhook(id: string) {
    return {
      webhook_id: id,
      delivery_id: this.db.id('delivery'),
      status: 'queued',
    };
  }

  webhookDeliveries(id: string) {
    return [
      { id: this.db.id('delivery'), webhook_id: id, status: 'delivered' },
    ];
  }

  retryWebhookDelivery(deliveryId: string) {
    return { delivery_id: deliveryId, status: 'queued' };
  }

  private organizationId(actor: RequestActor | undefined) {
    return this.db.actorOrDemo(actor).organizationId ?? 'demo-partner-org-id';
  }

  private assertOrganization(id: string) {
    const organization = this.db.partnerOrganizations.find(
      (item) => item.id === id,
    );
    if (!organization) {
      throw new NotFoundException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Partner topilmadi',
      });
    }

    return organization;
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
}
