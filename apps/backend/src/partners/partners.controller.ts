import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@agoda/types';
import { CurrentActor, type RequestActor } from '../common/actor';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PartnersService } from './partners.service';

@Controller('partner')
@UseGuards(RolesGuard)
@Roles(Role.PARTNER)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('profile')
  profile(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.profile(actor);
  }

  @Patch('profile')
  updateProfile(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.updateProfile(actor, body);
  }

  @Get('team')
  team(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.team(actor);
  }

  @Post('team')
  inviteTeamMember(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.inviteTeamMember(actor, body);
  }

  @Patch('team/:id')
  updateTeamMember(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.updateTeamMember(id, body);
  }

  @Delete('team/:id')
  deleteTeamMember(@Param('id') id: string) {
    return this.partnersService.deleteTeamMember(id);
  }

  @Get('documents')
  documents(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.documents(actor);
  }

  @Post('documents')
  addDocument(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.addDocument(actor, body);
  }

  @Post('application/submit')
  submitApplication(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.submitApplication(actor);
  }

  @Get('application/status')
  applicationStatus(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.applicationStatus(actor);
  }

  @Post('application/resubmit')
  resubmitApplication(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.resubmitApplication(actor);
  }

  @Get('hotels')
  hotels(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.hotels(actor);
  }

  @Post('hotels')
  createHotel(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.createHotel(actor, body);
  }

  @Get('hotels/:id')
  hotel(@Param('id') id: string) {
    return this.partnersService.hotel(id);
  }

  @Patch('hotels/:id')
  updateHotel(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.partnersService.updateHotel(id, body);
  }

  @Post('hotels/:id/submit-review')
  submitHotelReview(@Param('id') id: string) {
    return this.partnersService.submitHotelReview(id);
  }

  @Post('hotels/:id/images')
  addHotelImage(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.addHotelImage(id, body);
  }

  @Delete('hotels/:id/images/:imageId')
  deleteHotelImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.partnersService.deleteHotelImage(id, imageId);
  }

  @Get('hotels/:id/rooms')
  rooms(@Param('id') id: string) {
    return this.partnersService.rooms(id);
  }

  @Post('hotels/:id/rooms')
  createRoom(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.partnersService.createRoom(id, body);
  }

  @Patch('hotels/:id/rooms/:roomId')
  updateRoom(
    @Param('id') id: string,
    @Param('roomId') roomId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.updateRoom(id, roomId, body);
  }

  @Delete('hotels/:id/rooms/:roomId')
  deleteRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    return this.partnersService.deleteRoom(id, roomId);
  }

  @Get('hotels/:id/inventory')
  inventory(@Param('id') id: string) {
    return this.partnersService.inventory(id);
  }

  @Put('hotels/:id/inventory')
  updateInventory(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.updateInventory(id, body);
  }

  @Post('hotels/:id/blackout-dates')
  blackoutDates(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.blackoutDates(id, body);
  }

  @Get('vehicles')
  vehicles() {
    return this.partnersService.vehicles();
  }

  @Post('vehicles')
  createVehicle(@Body() body: Record<string, unknown>) {
    return this.partnersService.createVehicle(body);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.updateVehicle(id, body);
  }

  @Post('vehicles/:id/seat-layout')
  seatLayout(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.partnersService.seatLayout(id, body);
  }

  @Get('routes')
  routes() {
    return this.partnersService.routes();
  }

  @Post('routes')
  createRoute(@Body() body: Record<string, unknown>) {
    return this.partnersService.createRoute(body);
  }

  @Patch('routes/:id')
  updateRoute(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.partnersService.updateRoute(id, body);
  }

  @Get('trips')
  trips() {
    return this.partnersService.trips();
  }

  @Post('trips')
  createTrip(@Body() body: Record<string, unknown>) {
    return this.partnersService.createTrip(body);
  }

  @Patch('trips/:id')
  updateTrip(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.partnersService.updateTrip(id, body);
  }

  @Post('trips/:id/cancel')
  cancelTrip(@Param('id') id: string) {
    return this.partnersService.cancelTrip(id);
  }

  @Get('trips/:id/seats')
  tripSeats(@Param('id') id: string) {
    return this.partnersService.tripSeats(id);
  }

  @Get('bookings')
  bookings(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.bookings(actor);
  }

  @Get('bookings/:id')
  booking(@Param('id') id: string) {
    return this.partnersService.booking(id);
  }

  @Post('bookings/:id/confirm')
  confirmBooking(@Param('id') id: string) {
    return this.partnersService.bookingStatus(id, 'confirmed');
  }

  @Post('bookings/:id/reject')
  rejectBooking(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.rejectBooking(id, body);
  }

  @Post('bookings/:id/check-in')
  checkIn(@Param('id') id: string) {
    return this.partnersService.bookingStatus(id, 'checked_in');
  }

  @Post('bookings/:id/board')
  board(@Param('id') id: string) {
    return this.partnersService.bookingStatus(id, 'boarded');
  }

  @Post('bookings/:id/complete')
  complete(@Param('id') id: string) {
    return this.partnersService.bookingStatus(id, 'completed');
  }

  @Post('bookings/:id/cash-collected')
  cashCollected(@Param('id') id: string) {
    return this.partnersService.cashStatus(id, 'collected');
  }

  @Post('bookings/:id/cash-reversal')
  cashReversal(@Param('id') id: string) {
    return this.partnersService.cashStatus(id, 'reversed');
  }

  @Get('finance/overview')
  financeOverview(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.financeOverview(actor);
  }

  @Get('finance/ledger')
  ledger(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.ledger(actor);
  }

  @Get('finance/chart')
  financeChart(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.financeChart(actor);
  }

  @Post('withdrawals')
  withdrawal(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.withdrawal(actor, body);
  }

  @Get('withdrawals')
  withdrawals(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.withdrawals(actor);
  }

  @Post('exports/bookings')
  exportBookings(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.createExport(actor, 'partner-bookings', body);
  }

  @Post('exports/finance')
  exportFinance(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.createExport(actor, 'partner-finance', body);
  }

  @Get('finance/documents')
  financeDocuments(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.financeDocuments(actor);
  }

  @Get('finance/documents/:id/download')
  financeDocumentDownload(@Param('id') id: string) {
    return this.partnersService.financeDocumentDownload(id);
  }

  @Get('api-keys')
  apiKeys(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.apiKeys(actor);
  }

  @Post('api-keys')
  createApiKey(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.createApiKey(actor, body);
  }

  @Delete('api-keys/:id')
  revokeApiKey(@Param('id') id: string) {
    return this.partnersService.revokeApiKey(id);
  }

  @Get('webhooks')
  webhooks(@CurrentActor() actor: RequestActor | undefined) {
    return this.partnersService.webhooks(actor);
  }

  @Post('webhooks')
  createWebhook(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.createWebhook(actor, body);
  }

  @Patch('webhooks/:id')
  updateWebhook(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.partnersService.updateWebhook(id, body);
  }

  @Delete('webhooks/:id')
  deleteWebhook(@Param('id') id: string) {
    return this.partnersService.deleteWebhook(id);
  }

  @Post('webhooks/:id/test')
  testWebhook(@Param('id') id: string) {
    return this.partnersService.testWebhook(id);
  }

  @Get('webhooks/:id/deliveries')
  webhookDeliveries(@Param('id') id: string) {
    return this.partnersService.webhookDeliveries(id);
  }

  @Post('webhooks/deliveries/:deliveryId/retry')
  retryWebhookDelivery(@Param('deliveryId') deliveryId: string) {
    return this.partnersService.retryWebhookDelivery(deliveryId);
  }
}
