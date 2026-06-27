import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import { CurrentActor, type RequestActor } from '../common/actor';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(RolesGuard)
@Roles(Role.USER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  profile(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.profile(actor);
  }

  @Patch()
  updateProfile(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateProfile(actor, body);
  }

  @Post('avatar')
  uploadAvatar(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.setAvatar(actor, body);
  }

  @Delete('avatar')
  deleteAvatar(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.deleteAvatar(actor);
  }

  @Get('bookings')
  bookings(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.bookings(actor);
  }

  @Get('bookings/:id')
  booking(@Param('id') id: string) {
    return this.usersService.booking(id);
  }

  @Get('bonuses')
  bonuses(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.bonuses(actor);
  }

  @Get('favorites')
  favorites(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.favorites(actor);
  }

  @Post('favorites')
  addFavorite(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.addFavorite(actor, body);
  }

  @Delete('favorites/:id')
  deleteFavorite(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteFavorite(actor, id);
  }

  @Get('notifications/preferences')
  notificationPreferences(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.notificationPreferences(actor);
  }

  @Patch('notifications/preferences')
  updateNotificationPreferences(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateNotificationPreferences(actor, body);
  }

  @Post('data-export')
  dataExport(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.dataExport(actor);
  }

  @Post('delete-request')
  deleteRequest(@CurrentActor() actor: RequestActor | undefined) {
    return this.usersService.deleteRequest(actor);
  }
}
