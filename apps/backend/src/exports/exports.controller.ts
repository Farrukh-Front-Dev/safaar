import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@agoda/types';
import { CurrentActor, type RequestActor } from '../common/actor';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(RolesGuard)
@Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get(':id')
  findOne(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.exportsService.findOne(actor, id);
  }

  @Get(':id/download')
  download(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.exportsService.download(actor, id);
  }

  @Delete(':id')
  delete(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.exportsService.delete(actor, id);
  }
}
