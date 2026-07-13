import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PartnersService } from './partners.service';

@Controller('partners/requests')
export class PartnerRequestsController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  submit(@Body() body: Record<string, unknown>) {
    return this.partnersService.submitPublicPartnerRequest(body);
  }

  @Get()
  status(@Query('phone') phone?: string, @Query('email') email?: string) {
    return this.partnersService.publicPartnerRequestStatus(phone, email);
  }
}
