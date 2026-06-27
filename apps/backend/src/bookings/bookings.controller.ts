import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role, type CreateBookingDto } from '@agoda/types';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { BookingsService } from './bookings.service';

@Controller('bookings')
@UseGuards(RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.USER)
  create(@Body() dto: CreateBookingDto) {
    // TODO: userId JWT'dan olinadi (auth guard qo'shilgach).
    const userId = 'stub-user-id';
    return this.bookingsService.create(userId, dto);
  }

  @Get('my')
  @Roles(Role.USER)
  myBookings() {
    const userId = 'stub-user-id';
    return this.bookingsService.findByUser(userId);
  }
}
