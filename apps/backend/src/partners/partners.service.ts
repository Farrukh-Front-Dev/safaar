import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import {
  paginateArray,
  parsePagination,
  type QueryLike,
} from '../common/pagination';
import {
  type BookingRecord,
  InMemoryDbService,
} from '../infrastructure/in-memory-db.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { hashSecret, partnerApiPepper, randomToken } from '../auth/security';

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

  constructor(
    private readonly db: InMemoryDbService,
    private readonly jobs: JobQueueService,
  ) {}

  dashboard(actor: RequestActor | undefined) {
    const organizationId = this.organizationId(actor);
    const bookings = this.bookingsForOrganization(organizationId);
    const hotelIds = new Set(
      this.db.hotels
        .filter((hotel) => hotel.partner_organization_id === organizationId)
        .map((hotel) => hotel.id),
    );
    const today = new Date().toISOString().slice(0, 10);
    const todayBookings = bookings.filter((booking) =>
      booking.created_at.startsWith(today),
    ).length;
    const monthRevenue = bookings.reduce(
      (sum, booking) => sum + booking.partner_payable,
      0,
    );
    const totalCustomers = new Set(bookings.map((booking) => booking.user_id))
      .size;
    const hotelRatings = this.db.hotels
      .filter((hotel) => hotelIds.has(hotel.id))
      .map((hotel) => hotel.rating_average)
      .filter((rating) => Number.isFinite(rating));
    const rating = hotelRatings.length
      ? Number(
          (
            hotelRatings.reduce((sum, value) => sum + value, 0) /
            hotelRatings.length
          ).toFixed(1),
        )
      : 0;

    return {
      todayBookings,
      monthRevenue,
      totalCustomers,
      rating,
    };
  }

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

  hotels(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    return this.paginatePartner(
      this.db.hotels.filter(
        (hotel) => hotel.partner_organization_id === organizationId,
      ),
      query,
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

  hotel(actor: RequestActor | undefined, id: string) {
    return this.assertHotel(id, actor);
  }

  updateHotel(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    hotel.address = body.address ? String(body.address) : hotel.address;
    hotel.stars = body.stars ? Number(body.stars) : hotel.stars;
    hotel.status = body.status
      ? (String(body.status) as typeof hotel.status)
      : hotel.status;
    return hotel;
  }

  submitHotelReview(actor: RequestActor | undefined, id: string) {
    const hotel = this.assertHotel(id, actor);
    hotel.status = 'pending_review';
    return hotel;
  }

  addHotelImage(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    const image = String(
      body.url ?? body.image_url ?? `/mock/${this.db.id('image')}`,
    );
    hotel.images.push(image);
    return { hotel_id: id, image_url: image };
  }

  deleteHotelImage(
    actor: RequestActor | undefined,
    id: string,
    imageId: string,
  ) {
    this.assertHotel(id, actor);
    return { hotel_id: id, image_id: imageId, deleted: true };
  }

  rooms(actor: RequestActor | undefined, id: string) {
    this.assertHotel(id, actor);
    return this.db.rooms.filter((room) => room.hotel_id === id);
  }

  roomTypes(actor: RequestActor | undefined, id: string) {
    this.assertHotel(id, actor);
    return this.db.roomTypes;
  }

  createRoomType(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotel(id, actor);
    const roomType = {
      id: this.db.id('room_type'),
      name: localizedText(body, 'name', 'Yangi xona turi'),
    };
    this.db.roomTypes.unshift(roomType);
    return roomType;
  }

  updateRoomType(
    actor: RequestActor | undefined,
    id: string,
    roomTypeId: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotel(id, actor);
    const roomType = this.db.roomTypes.find((item) => item.id === roomTypeId);
    if (!roomType) {
      throw new NotFoundException({
        code: 'ROOM_TYPE_NOT_FOUND',
        message: 'Xona turi topilmadi',
      });
    }
    roomType.name = localizedText(body, 'name', roomType.name.uz);
    return roomType;
  }

  deleteRoomType(
    actor: RequestActor | undefined,
    id: string,
    roomTypeId: string,
  ) {
    this.assertHotel(id, actor);
    const inUse = this.db.rooms.some(
      (room) => room.hotel_id === id && room.room_type_id === roomTypeId,
    );
    if (inUse) {
      return {
        ok: false,
        reason:
          "Bu turdan foydalanayotgan xonalar bor. Avval ularni boshqa turga o'tkazing.",
      };
    }

    const index = this.db.roomTypes.findIndex((item) => item.id === roomTypeId);
    if (index >= 0) {
      this.db.roomTypes.splice(index, 1);
    }
    return { ok: true, room_type_id: roomTypeId, deleted: true };
  }

  createRoom(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotel(id, actor);
    const code = String(
      body.code ?? body.number ?? body.room_number ?? `R-${Date.now()}`,
    );
    const roomTypeId = String(
      body.room_type_id ?? body.roomTypeId ?? body.room_type ?? 'standard',
    );
    const room = {
      id: this.db.id('room'),
      hotel_id: id,
      room_type_id: roomTypeId,
      code,
      name: {
        uz: String(body.name_uz ?? body.name ?? `${code}-xona`),
        ru: String(body.name_ru ?? body.name ?? `Номер ${code}`),
        en: String(body.name_en ?? body.name ?? `Room ${code}`),
      },
      base_occupancy: Number(body.base_occupancy ?? body.capacity ?? 2),
      max_adults: Number(body.max_adults ?? body.capacity ?? 2),
      max_children: Number(body.max_children ?? 1),
      total_inventory: Number(body.total_inventory ?? body.inventory ?? 1),
      base_price: Number(
        body.base_price ?? body.basePrice ?? body.nightlyPrice ?? 30000000,
      ),
      status: 'active' as const,
    };
    this.db.rooms.unshift(room);
    return room;
  }

  updateRoom(
    actor: RequestActor | undefined,
    id: string,
    roomId: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotel(id, actor);
    const room = this.db.rooms.find(
      (item) => item.id === roomId && item.hotel_id === id,
    );
    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Xona topilmadi',
      });
    }
    room.code =
      body.code || body.number ? String(body.code ?? body.number) : room.code;
    room.room_type_id =
      body.room_type_id || body.roomTypeId
        ? String(body.room_type_id ?? body.roomTypeId)
        : room.room_type_id;
    room.base_price = body.base_price
      ? Number(body.base_price)
      : body.basePrice
        ? Number(body.basePrice)
        : body.nightlyPrice
          ? Number(body.nightlyPrice)
          : room.base_price;
    room.total_inventory = body.total_inventory
      ? Number(body.total_inventory)
      : body.inventory
        ? Number(body.inventory)
        : room.total_inventory;
    room.base_occupancy = body.base_occupancy
      ? Number(body.base_occupancy)
      : body.capacity
        ? Number(body.capacity)
        : room.base_occupancy;
    room.max_adults = body.max_adults
      ? Number(body.max_adults)
      : body.capacity
        ? Number(body.capacity)
        : room.max_adults;
    room.name =
      body.name || body.name_uz
        ? localizedText(body, 'name', room.name.uz)
        : room.name;
    return room;
  }

  createRoomsBulk(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertHotel(id, actor);
    const floor = Number(body.floor ?? 1);
    const startNumber = Number(body.startNumber ?? body.start_number ?? 101);
    const count = Math.max(0, Math.min(Number(body.count ?? 0), 200));
    const roomTypeId = String(
      body.roomTypeId ?? body.room_type_id ?? body.room_type ?? 'standard',
    );
    const created: Array<(typeof this.db.rooms)[number]> = [];
    const existingCodes = new Set(
      this.db.rooms
        .filter((room) => room.hotel_id === id)
        .map((room) => room.code),
    );

    for (let index = 0; index < count; index += 1) {
      const code = String(startNumber + index);
      if (existingCodes.has(code)) {
        continue;
      }
      created.push(
        this.createRoom(actor, id, {
          ...body,
          code,
          number: code,
          floor,
          room_type_id: roomTypeId,
        }),
      );
      existingCodes.add(code);
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

  deleteRoom(actor: RequestActor | undefined, id: string, roomId: string) {
    this.assertHotel(id, actor);
    const room = this.db.rooms.find(
      (item) => item.id === roomId && item.hotel_id === id,
    );
    if (room) {
      room.status = 'inactive';
    }
    return { hotel_id: id, room_id: roomId, deleted: true };
  }

  inventory(actor: RequestActor | undefined, id: string) {
    this.assertHotel(id, actor);
    return this.rooms(actor, id).map((room) => ({
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
    this.assertHotel(id, actor);
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
    this.assertHotel(id, actor);
    return {
      hotel_id: id,
      dates: body.dates ?? [],
      closed: true,
    };
  }

  updateListingGeneral(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    hotel.name = localizedText(body, 'name', hotel.name.uz);
    hotel.description = localizedText(
      body,
      'description',
      hotel.description.uz,
    );
    hotel.stars = body.stars ? Number(body.stars) : hotel.stars;
    return hotel;
  }

  updateListingLocation(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    hotel.address = body.address ? String(body.address) : hotel.address;
    hotel.latitude =
      body.latitude === undefined ? hotel.latitude : Number(body.latitude);
    hotel.longitude =
      body.longitude === undefined ? hotel.longitude : Number(body.longitude);
    return hotel;
  }

  updateListingRules(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    hotel.check_in_time = body.checkInTime
      ? String(body.checkInTime)
      : body.check_in_time
        ? String(body.check_in_time)
        : hotel.check_in_time;
    hotel.check_out_time = body.checkOutTime
      ? String(body.checkOutTime)
      : body.check_out_time
        ? String(body.check_out_time)
        : hotel.check_out_time;
    return {
      ...hotel,
      cancellation_policy: body.cancellationPolicy ?? body.cancellation_policy,
      smoking_allowed: body.smokingAllowed ?? body.smoking_allowed,
      pets_allowed: body.petsAllowed ?? body.pets_allowed,
      children_allowed: body.childrenAllowed ?? body.children_allowed,
      extra_fees: body.extraFees ?? body.extra_fees ?? [],
    };
  }

  updateListingAmenities(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    hotel.amenities = Array.isArray(body.amenities)
      ? body.amenities.map(String)
      : hotel.amenities;
    return hotel;
  }

  updateListingStatus(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const hotel = this.assertHotel(id, actor);
    hotel.status = listingStatus(body.status);
    return hotel;
  }

  publishListing(actor: RequestActor | undefined, id: string) {
    const hotel = this.assertHotel(id, actor);
    hotel.status = 'pending_review';
    return hotel;
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

  trips(query: QueryLike = {}) {
    return this.paginatePartner(this.db.trips, query);
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

  bookings(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    return this.paginatePartner(
      this.bookingsForOrganization(organizationId),
      query,
    );
  }

  createBooking(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const organizationId = this.organizationId(actor);
    const hotelId = String(
      body.hotel_id ??
        body.hotelId ??
        this.db.hotels.find(
          (hotel) => hotel.partner_organization_id === organizationId,
        )?.id ??
        '',
    );
    const hotel = this.assertHotel(hotelId, actor);
    const roomTypeId = String(body.roomTypeId ?? body.room_type_id ?? '');
    const room =
      this.db.rooms.find(
        (item) =>
          item.hotel_id === hotel.id &&
          (roomTypeId ? item.room_type_id === roomTypeId : true),
      ) ?? this.db.rooms.find((item) => item.hotel_id === hotel.id);

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Tanlangan hotel uchun xona topilmadi',
      });
    }

    const checkIn = String(
      body.checkIn ?? body.check_in ?? new Date().toISOString().slice(0, 10),
    );
    const checkOut = String(body.checkOut ?? body.check_out ?? checkIn);
    const nights = Math.max(1, Number(body.nights ?? 1));
    const totalAmount = Number(
      body.totalPrice ?? body.total_amount ?? room.base_price * nights,
    );
    const commissionAmount = Math.round(totalAmount * 0.12);
    const now = this.db.now();
    const booking: BookingRecord = {
      id: this.db.id('booking'),
      booking_number: this.db.bookingNumber(),
      user_id: 'demo-user-id',
      partner_organization_id: organizationId,
      type: 'hotel',
      confirmation_mode: 'instant_confirmation',
      payment_method: 'cash',
      status: BookingStatus.CONFIRMED,
      currency: 'UZS',
      subtotal: totalAmount,
      discount_amount: 0,
      bonus_amount: 0,
      service_fee: 0,
      total_amount: totalAmount,
      commission_amount: commissionAmount,
      partner_payable: totalAmount - commissionAmount,
      confirmed_at: now,
      item: {
        hotel_id: hotel.id,
        room_id: room.id,
        room_type_id: room.room_type_id,
        room_number: body.roomNumber ?? body.room_number,
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
      },
      created_at: now,
      updated_at: now,
    };

    this.db.bookings.unshift(booking);
    this.db.createPayment(booking, 'cash');
    return booking;
  }

  booking(actor: RequestActor | undefined, id: string) {
    const organizationId = this.organizationId(actor);
    const booking = this.db.findBooking(id);
    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }
    if (booking.partner_organization_id !== organizationId) {
      throw new ForbiddenException({
        code: 'BOOKING_FORBIDDEN',
        message: 'Bu bron sizning tashkilotingizga tegishli emas',
      });
    }
    return booking;
  }

  assignRoom(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const booking = this.booking(actor, id);
    booking.item = {
      ...booking.item,
      room_number: String(body.roomNumber ?? body.room_number ?? ''),
    };
    booking.updated_at = this.db.now();
    return booking;
  }

  bookingStatus(actor: RequestActor | undefined, id: string, status: string) {
    const booking = this.booking(actor, id);
    if (status === 'confirmed') {
      booking.status = BookingStatus.CONFIRMED;
      booking.confirmed_at = this.db.now();
    }
    if (status === 'checked_in') {
      booking.status = BookingStatus.CONFIRMED;
      booking.item = {
        ...booking.item,
        checked_in_at: this.db.now(),
      };
    }
    if (status === 'boarded') {
      booking.item = {
        ...booking.item,
        boarded_at: this.db.now(),
      };
    }
    if (status === 'completed') {
      booking.status = BookingStatus.COMPLETED;
      booking.item = {
        ...booking.item,
        checked_out_at: this.db.now(),
      };
    }
    booking.updated_at = this.db.now();
    return booking;
  }

  rejectBooking(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const booking = this.booking(actor, id);
    booking.status = BookingStatus.CANCELLED;
    booking.cancel_reason_text = String(body.reason ?? 'Partner rad etdi');
    booking.cancelled_at = this.db.now();
    return booking;
  }

  cashStatus(
    actor: RequestActor | undefined,
    id: string,
    status: 'collected' | 'reversed',
  ) {
    this.booking(actor, id);
    const payment = this.db.findPaymentByBooking(id);
    if (payment) {
      payment.status = status === 'collected' ? 'paid' : 'awaiting_cash';
      payment.updated_at = this.db.now();
    }
    return { booking_id: id, cash_status: status, payment };
  }

  financeOverview(actor: RequestActor | undefined) {
    const bookings = this.bookingsForOrganization(this.organizationId(actor));
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

  ledger(actor: RequestActor | undefined, query: QueryLike = {}) {
    return this.paginatePartner(
      this.bookingsForOrganization(this.organizationId(actor)).map(
        (booking) => ({
          id: this.db.id('ledger'),
          booking_id: booking.id,
          amount: booking.partner_payable,
          currency: booking.currency,
          type: 'booking_payable',
          created_at: booking.created_at,
        }),
      ),
      query,
    );
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

  withdrawals(actor: RequestActor | undefined, query: QueryLike = {}) {
    const organizationId = this.organizationId(actor);
    return this.paginatePartner(
      this.withdrawalsStore.filter(
        (withdrawal) => withdrawal['organization_id'] === organizationId,
      ),
      query,
    );
  }

  async createExport(
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
    await this.jobs.add(
      'partner-export',
      {
        export_id: job.id,
        owner_id: currentActor.id,
        type,
        format,
      },
      {
        idempotencyKey: `partner-export:${currentActor.id}:${type}:${format}`,
      },
    );
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
    return this.db.partnerApiKeys
      .filter((key) => key['organization_id'] === organizationId)
      .map((key) => this.publicApiKey(key));
  }

  createApiKey(actor: RequestActor | undefined, body: Record<string, unknown>) {
    const prefix = `uzb_live_${randomToken(5)}`;
    const fullKey = `${prefix}_${randomToken(24)}`;
    const apiKey = {
      id: this.db.id('api_key'),
      organization_id: this.organizationId(actor),
      name: String(body.name ?? 'Default API key'),
      key_prefix: prefix,
      scopes: Array.isArray(body.scopes) ? body.scopes : ['bookings:read'],
      status: 'active',
      created_at: this.db.now(),
      updated_at: this.db.now(),
      secret_hash: hashSecret(fullKey, partnerApiPepper()),
    };
    this.db.partnerApiKeys.unshift(apiKey);
    return { ...this.publicApiKey(apiKey), api_key: fullKey };
  }

  revokeApiKey(actor: RequestActor | undefined, id: string) {
    const apiKey = this.assertApiKey(actor, id);
    apiKey['status'] = 'revoked';
    apiKey['revoked_at'] = this.db.now();
    apiKey['updated_at'] = this.db.now();
    return this.publicApiKey(apiKey);
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

  updateWebhook(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const webhook = this.assertWebhook(actor, id);
    webhook['url'] = body.url ? String(body.url) : webhook['url'];
    webhook['events'] = Array.isArray(body.events)
      ? body.events
      : webhook['events'];
    webhook['updated_at'] = this.db.now();
    return webhook;
  }

  deleteWebhook(actor: RequestActor | undefined, id: string) {
    const webhook = this.assertWebhook(actor, id);
    webhook['status'] = 'deleted';
    webhook['deleted_at'] = this.db.now();
    return { id, deleted: true };
  }

  testWebhook(actor: RequestActor | undefined, id: string) {
    this.assertWebhook(actor, id);
    return {
      webhook_id: id,
      delivery_id: this.db.id('delivery'),
      status: 'queued',
    };
  }

  webhookDeliveries(actor: RequestActor | undefined, id: string) {
    this.assertWebhook(actor, id);
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

  private bookingsForOrganization(organizationId: string) {
    return this.db.bookings.filter(
      (booking) => booking.partner_organization_id === organizationId,
    );
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

  private assertHotel(id: string, actor?: RequestActor) {
    const hotel = this.db.hotels.find((item) => item.id === id);
    if (!hotel) {
      throw new NotFoundException({
        code: 'HOTEL_NOT_FOUND',
        message: 'Hotel topilmadi',
      });
    }

    if (actor && hotel.partner_organization_id !== this.organizationId(actor)) {
      throw new ForbiddenException({
        code: 'HOTEL_FORBIDDEN',
        message: 'Bu hotel sizning tashkilotingizga tegishli emas',
      });
    }

    return hotel;
  }

  private assertApiKey(actor: RequestActor | undefined, id: string) {
    const organizationId = this.organizationId(actor);
    const apiKey = this.db.partnerApiKeys.find(
      (key) => key['id'] === id && key['organization_id'] === organizationId,
    );
    if (!apiKey) {
      throw new NotFoundException({
        code: 'API_KEY_INVALID',
        message: 'API key topilmadi',
      });
    }
    return apiKey;
  }

  private assertWebhook(actor: RequestActor | undefined, id: string) {
    const organizationId = this.organizationId(actor);
    const webhook = this.db.partnerWebhooks.find(
      (item) => item['id'] === id && item['organization_id'] === organizationId,
    );
    if (!webhook) {
      throw new NotFoundException({
        code: 'WEBHOOK_NOT_FOUND',
        message: 'Webhook topilmadi',
      });
    }
    return webhook;
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
