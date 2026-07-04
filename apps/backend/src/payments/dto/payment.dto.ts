import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  event_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: 'UZS' })
  @IsOptional()
  @IsString()
  currency?: string;
}
