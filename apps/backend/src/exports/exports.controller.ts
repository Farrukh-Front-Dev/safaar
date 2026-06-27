import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@agoda/types';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(RolesGuard)
@Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportsService.findOne(id);
  }

  @Get(':id/download')
  download(@Param('id') id: string) {
    return this.exportsService.download(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.exportsService.delete(id);
  }
}
