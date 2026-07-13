import { Module } from '@nestjs/common';
import { PartnerRequestsController } from './partner-requests.controller';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  controllers: [PartnerRequestsController, PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
