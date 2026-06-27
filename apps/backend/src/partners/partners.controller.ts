import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@agoda/types';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PartnersService } from './partners.service';

@Controller('partners')
@UseGuards(RolesGuard)
@Roles(Role.PARTNER)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('dashboard')
  dashboard() {
    const partnerId = 'stub-partner-id';
    return this.partnersService.getDashboard(partnerId);
  }
}
