import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import { CurrentActor, type RequestActor } from '../common/actor';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles(Role.USER)
  create(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.reviewsService.create(actor, body);
  }

  @Patch(':id')
  @Roles(Role.USER)
  update(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.reviewsService.update(actor, id, body);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  delete(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.reviewsService.delete(actor, id);
  }

  @Post(':id/reply')
  @Roles(Role.PARTNER)
  reply(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.reviewsService.reply(actor, id, body);
  }
}
