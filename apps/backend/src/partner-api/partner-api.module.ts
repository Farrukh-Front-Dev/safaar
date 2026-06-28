import { Module } from '@nestjs/common';
import { PartnerApiController } from './partner-api.controller';
import { PartnerApiService } from './partner-api.service';

@Module({
  controllers: [PartnerApiController],
  providers: [PartnerApiService],
})
export class PartnerApiModule {}
