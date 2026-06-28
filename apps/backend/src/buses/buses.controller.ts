import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusesService } from './buses.service';
import { BusQuoteDto } from './dto/bus.dto';

@ApiTags('buses')
@Controller()
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Get('bus-routes')
  routes() {
    return this.busesService.routes();
  }

  @Get('bus-trips')
  trips(@Query() query: Record<string, string | undefined>) {
    return this.busesService.trips(query);
  }

  @Get('bus-trips/:id')
  trip(@Param('id') id: string) {
    return this.busesService.trip(id);
  }

  @Get('bus-trips/:id/seats')
  seats(@Param('id') id: string) {
    return this.busesService.seats(id);
  }

  @Post('bus-trips/:id/quote')
  quote(@Param('id') id: string, @Body() body: BusQuoteDto) {
    return this.busesService.quote(
      id,
      body as unknown as Record<string, unknown>,
    );
  }

  @Get('bus-companies/:id/reviews')
  companyReviews(@Param('id') id: string) {
    return this.busesService.companyReviews(id);
  }
}
