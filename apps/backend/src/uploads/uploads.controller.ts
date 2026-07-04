import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import { CurrentActor, type RequestActor } from '../common/actor';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('images')
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  image(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.uploadsService.create(actor, 'image', body);
  }

  @Post('documents')
  @Roles(Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  document(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.uploadsService.create(actor, 'document', body);
  }

  @Post('presign')
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  presign(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.uploadsService.presign(actor, body);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  delete(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.uploadsService.delete(actor, id);
  }
}
