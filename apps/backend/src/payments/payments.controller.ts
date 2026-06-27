import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@agoda/types';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ProviderWebhookDto } from './dto/payment.dto';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payments/:bookingId')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  payment(@Param('bookingId') bookingId: string) {
    return this.paymentsService.payment(bookingId);
  }

  @Post('payments/:bookingId/create')
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  createPayment(
    @Param('bookingId') bookingId: string,
    @Body() body: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(
      bookingId,
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('webhooks/click/prepare')
  clickPrepare(@Body() body: ProviderWebhookDto) {
    return this.paymentsService.providerWebhook(
      'click',
      'prepare',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('webhooks/click/complete')
  clickComplete(@Body() body: ProviderWebhookDto) {
    return this.paymentsService.providerWebhook(
      'click',
      'complete',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('webhooks/payme')
  payme(@Body() body: ProviderWebhookDto) {
    return this.paymentsService.providerWebhook(
      'payme',
      'callback',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('webhooks/uzcard')
  uzcard(@Body() body: ProviderWebhookDto) {
    return this.paymentsService.providerWebhook(
      'uzcard',
      'callback',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('webhooks/humo')
  humo(@Body() body: ProviderWebhookDto) {
    return this.paymentsService.providerWebhook(
      'humo',
      'callback',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('webhooks/payment/:provider')
  paymentProvider(
    @Param('provider') provider: string,
    @Body() body: ProviderWebhookDto,
  ) {
    return this.paymentsService.providerWebhook(
      provider,
      'callback',
      body as unknown as Record<string, unknown>,
    );
  }
}
