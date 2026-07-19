import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@Safaar/types';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PromosService } from './promos.service';

@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  validate(@Body() body: Record<string, unknown>) {
    return this.promosService.validate(body);
  }
}
