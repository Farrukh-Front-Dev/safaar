import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ enum: ['click', 'payme', 'uzcard', 'humo', 'cash'] })
  @IsIn(['click', 'payme', 'uzcard', 'humo', 'cash'])
  provider!: string;
}

export class ProviderWebhookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  booking_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_id?: string;
}
