import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BookingStatus, Role } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import {
  type BookingRecord,
  type ConfirmationMode,
  InMemoryDbService,
  type PaymentMethod,
} from '../infrastructure/in-memory-db.service';

@Injectable()
export class BookingsService {
  constructor(private readonly db: InMemoryDbService) {}

  createHotel(actor: RequestActor | undefined, dto: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const hotelId = String(dto.hotel_id ?? dto.hotelId ?? '');
    const roomId = String(dto.room_id ?? dto.roomTypeId ?? '');
    const hotel = this.db.hotels.find((item) => item.id === hotelId);
    const room = this.db.rooms.find(
      (item) => item.id === roomId && item.hotel_id === hotelId,
    );

    if (!hotel || !room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_AVAILABLE',
        message: 'Tanlangan sanalar uchun xona mavjud emas',
      });
    }

    const checkIn = String(dto.check_in ?? dto.checkIn ?? '');
    const checkOut = String(dto.check_out ?? dto.checkOut ?? '');
    const nights = this.calculateNights(checkIn, checkOut);
    const rooms = Number(dto.rooms ?? 1);
    const subtotal = room.base_price * nights * rooms;
    const booking = this.createBooking(currentActor.id, {
      type: 'hotel',
      partner_organization_id: hotel.partner_organization_id,
      payment_method: this.paymentMethod(dto.payment_method),
      confirmation_mode: this.confirmationMode(dto.confirmation_mode),
      subtotal,
      item: {
        hotel_id: hotel.id,
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        rooms,
        adults: Number(dto.adults ?? dto.guests ?? 1),
        children: Number(dto.children ?? 0),
      },
    });

    const payment = this.db.createPayment(booking);
    return { booking, payment };
  }

  createBus(actor: RequestActor | undefined, dto: Record<string, unknown>) {
    const currentActor = this.db.actorOrDemo(actor);
    const tripId = String(dto.trip_id ?? dto.tripId ?? '');
    const trip = this.db.trips.find((item) => item.id === tripId);

    if (!trip) {
      throw new NotFoundException({
        code: 'TRIP_NOT_FOUND',
        message: 'Reys topilmadi',
      });
    }

    const seatCodes = Array.isArray(dto.seats)
      ? dto.seats.map(String)
      : this.db.tripSeats
          .filter(
            (seat) => seat.trip_id === trip.id && seat.status === 'available',
          )
          .slice(0, 1)
          .map((seat) => seat.seat_code);
    const seats = this.db.tripSeats.filter(
      (seat) => seat.trip_id === trip.id && seatCodes.includes(seat.seat_code),
    );

    if (
      seats.length !== seatCodes.length ||
      seats.some((seat) => seat.status !== 'available')
    ) {
      throw new UnprocessableEntityException({
        code: 'SEAT_NOT_AVAILABLE',
        message: 'O‘rindiq band',
      });
    }

    const partnerOrganizationId =
      this.db.busCompanies.find((company) => company.id === trip.company_id)
        ?.partner_organization_id ?? 'demo-partner-org-id';
    const subtotal = seats.reduce((sum, seat) => sum + seat.price, 0);
    const booking = this.createBooking(currentActor.id, {
      type: 'bus',
      partner_organization_id: partnerOrganizationId,
      payment_method: this.paymentMethod(dto.payment_method),
      confirmation_mode: this.confirmationMode(dto.confirmation_mode),
      subtotal,
      item: {
        trip_id: trip.id,
        seats: seats.map((seat) => seat.seat_code),
        passengers: dto.passengers ?? [],
      },
    });

    for (const seat of seats) {
      seat.status = 'held';
      seat.held_by_booking_id = booking.id;
      seat.held_until = booking.expires_at;
    }

    const payment = this.db.createPayment(booking);
    return { booking, payment };
  }

  findOne(actor: RequestActor | undefined, id: string) {
    const booking = this.assertBooking(id, actor);
    return {
      ...booking,
      payment: this.db.findPaymentByBooking(id),
    };
  }

  retryPayment(actor: RequestActor | undefined, id: string) {
    const booking = this.assertBooking(id, actor);
    return this.db.createPayment(booking);
  }

  cancelPreview(actor: RequestActor | undefined, id: string) {
    const booking = this.assertBooking(id, actor);
    const refundAmount = Math.round(booking.total_amount * 0.8);

    return {
      booking_id: id,
      currency: booking.currency,
      paid_amount: booking.total_amount,
      refund_amount: refundAmount,
      penalty_amount: booking.total_amount - refundAmount,
      policy: 'Flexible: 24 soatgacha 80% refund',
    };
  }

  cancel(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    const booking = this.assertBooking(id, actor);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new UnprocessableEntityException({
        code: 'BOOKING_INVALID_STATUS',
        message: 'Bron allaqachon bekor qilingan',
      });
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelled_at = this.db.now();
    booking.cancel_reason_text = String(body.reason ?? 'Bekor qilindi');
    booking.updated_at = this.db.now();
    this.addStatusHistory(booking, 'cancelled', actor);
    this.db.audit('booking.cancel', actor, {
      booking_id: id,
      reason: booking.cancel_reason_text,
    });

    return booking;
  }

  voucher(actor: RequestActor | undefined, id: string) {
    const booking = this.assertBooking(id, actor);

    return {
      booking_id: id,
      booking_number: booking.booking_number,
      format: 'pdf',
      download_url: `https://api.uzbron.uz/v1/bookings/${id}/voucher/mock.pdf`,
    };
  }

  statusHistory(actor: RequestActor | undefined, id: string) {
    this.assertBooking(id, actor);
    return this.db.bookingStatusHistory.filter(
      (entry) => entry['booking_id'] === id,
    );
  }

  conversation(actor: RequestActor | undefined, id: string) {
    const booking = this.assertBooking(id, actor);
    return {
      id: `conversation_${id}`,
      booking_id: id,
      participants: [
        { type: 'user', id: booking.user_id },
        { type: 'partner', id: booking.partner_organization_id },
      ],
    };
  }

  messages(actor: RequestActor | undefined, id: string) {
    this.assertBooking(id, actor);
    return this.db.bookingMessages.filter(
      (message) => message['booking_id'] === id,
    );
  }

  sendMessage(
    actor: RequestActor | undefined,
    id: string,
    body: Record<string, unknown>,
  ) {
    this.assertBooking(id, actor);
    const currentActor = this.db.actorOrDemo(actor);
    const message = {
      id: this.db.id('msg'),
      booking_id: id,
      sender_type: currentActor.actorType,
      sender_id: currentActor.id,
      message_type: 'text',
      body: String(body.body ?? ''),
      created_at: this.db.now(),
      read_by: [currentActor.id],
    };
    this.db.bookingMessages.push(message);
    return message;
  }

  readMessage(actor: RequestActor | undefined, id: string, messageId: string) {
    this.assertBooking(id, actor);
    const message = this.db.bookingMessages.find(
      (item) => item['id'] === messageId && item['booking_id'] === id,
    );

    if (!message) {
      throw new NotFoundException({
        code: 'BOOKING_CHAT_FORBIDDEN',
        message: 'Xabar topilmadi',
      });
    }

    message['read_at'] = this.db.now();
    return message;
  }

  findByUser(userId: string): BookingRecord[] {
    return this.db.bookings.filter((booking) => booking.user_id === userId);
  }

  private createBooking(
    userId: string,
    input: {
      type: 'hotel' | 'bus';
      partner_organization_id: string;
      payment_method: PaymentMethod;
      confirmation_mode: ConfirmationMode;
      subtotal: number;
      item: Record<string, unknown>;
    },
  ): BookingRecord {
    const commission = Math.round(input.subtotal * 0.12);
    const booking: BookingRecord = {
      id: this.db.id('booking'),
      booking_number: this.db.bookingNumber(),
      user_id: userId,
      partner_organization_id: input.partner_organization_id,
      type: input.type,
      confirmation_mode: input.confirmation_mode,
      payment_method: input.payment_method,
      status: BookingStatus.PENDING,
      currency: 'UZS',
      subtotal: input.subtotal,
      discount_amount: 0,
      bonus_amount: 0,
      service_fee: 0,
      total_amount: input.subtotal,
      commission_amount: commission,
      partner_payable: input.subtotal - commission,
      partner_confirmation_deadline:
        input.confirmation_mode === 'request_confirmation'
          ? new Date(Date.now() + 30 * 60_000).toISOString()
          : undefined,
      expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
      confirmed_at: undefined,
      item: input.item,
      created_at: this.db.now(),
      updated_at: this.db.now(),
    };
    this.db.bookings.unshift(booking);
    this.addStatusHistory(booking, 'created');
    return booking;
  }

  private addStatusHistory(
    booking: BookingRecord,
    action: string,
    actor?: RequestActor,
  ) {
    this.db.bookingStatusHistory.unshift({
      id: this.db.id('bsh'),
      booking_id: booking.id,
      status: booking.status,
      action,
      actor_id: actor?.id ?? 'system',
      created_at: this.db.now(),
    });
  }

  private assertBooking(id: string, actor?: RequestActor): BookingRecord {
    const booking = this.db.findBooking(id);

    if (!booking) {
      throw new NotFoundException({
        code: 'BOOKING_EXPIRED',
        message: 'Bron topilmadi',
      });
    }

    if (
      !actor ||
      actor.role === Role.SUPER_ADMIN ||
      actor.actorType === 'admin'
    ) {
      return booking;
    }

    if (actor.actorType === 'user' && booking.user_id === actor.id) {
      return booking;
    }

    if (
      actor.actorType === 'partner' &&
      booking.partner_organization_id === actor.organizationId
    ) {
      return booking;
    }

    throw new ForbiddenException({
      code: 'BOOKING_FORBIDDEN',
      message: 'Bu bron sizga tegishli emas',
    });
  }

  assertBookingForActor(
    actor: RequestActor | undefined,
    id: string,
  ): BookingRecord {
    return this.assertBooking(id, actor);
  }

  private paymentMethod(value: unknown): PaymentMethod {
    const method = String(value ?? 'click') as PaymentMethod;
    return ['click', 'payme', 'uzcard', 'humo', 'cash'].includes(method)
      ? method
      : 'click';
  }

  private confirmationMode(value: unknown): ConfirmationMode {
    const mode = String(value ?? 'instant_confirmation') as ConfirmationMode;
    return mode === 'request_confirmation' ? mode : 'instant_confirmation';
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
