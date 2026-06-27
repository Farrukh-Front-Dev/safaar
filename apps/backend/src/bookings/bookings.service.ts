import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  type Booking,
  type CreateBookingDto,
} from '@agoda/types';

@Injectable()
export class BookingsService {
  private readonly bookings: Booking[] = [];

  create(userId: string, dto: CreateBookingDto): Booking {
    const booking: Booking = {
      id: `BK-${Date.now()}`,
      userId,
      hotelId: dto.hotelId,
      roomTypeId: dto.roomTypeId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      guests: dto.guests,
      totalPrice: 0, // TODO: narxni hisoblash.
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(booking);
    return booking;
  }

  findByUser(userId: string): Booking[] {
    return this.bookings.filter((b) => b.userId === userId);
  }
}
