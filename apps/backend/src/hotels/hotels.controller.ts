import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { HotelQuoteDto } from './dto/hotel.dto';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@Query() query: Record<string, string | undefined>) {
    return this.hotelsService.findAll(query);
  }

  @Get('map')
  map(@Query() query: Record<string, string | undefined>) {
    return this.hotelsService.map(query);
  }

  @Get(':slugOrId')
  findOne(@Param('slugOrId') slugOrId: string) {
    return this.hotelsService.findOne(slugOrId);
  }

  @Get(':id/rooms')
  rooms(@Param('id') id: string) {
    return this.hotelsService.rooms(id);
  }

  @Post(':id/quote')
  quote(@Param('id') id: string, @Body() body: HotelQuoteDto) {
    return this.hotelsService.quote(
      id,
      body as unknown as Record<string, unknown>,
    );
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string) {
    return this.hotelsService.reviews(id);
  }
}
