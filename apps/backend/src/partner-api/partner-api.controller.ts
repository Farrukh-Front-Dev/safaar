import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { PartnerApiService } from './partner-api.service';

@Controller('partner-api')
export class PartnerApiController {
  constructor(private readonly partnerApiService: PartnerApiService) {}

  @Get('bookings')
  bookings(@Headers('x-api-key') apiKey: string | undefined) {
    return this.partnerApiService.bookings(apiKey);
  }

  @Get('bookings/:id')
  booking(
    @Headers('x-api-key') apiKey: string | undefined,
    @Param('id') id: string,
  ) {
    return this.partnerApiService.booking(apiKey, id);
  }

  @Post('bookings/:id/status')
  bookingStatus(
    @Headers('x-api-key') apiKey: string | undefined,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnerApiService.bookingStatus(apiKey, id, body);
  }

  @Get('hotels')
  hotels(@Headers('x-api-key') apiKey: string | undefined) {
    return this.partnerApiService.hotels(apiKey);
  }

  @Get('trips')
  trips(@Headers('x-api-key') apiKey: string | undefined) {
    return this.partnerApiService.trips(apiKey);
  }

  @Post('webhooks/test')
  webhookTest(
    @Headers('x-api-key') apiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnerApiService.webhookTest(apiKey, body);
  }
}
