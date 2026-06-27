import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class HotelQuoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  room_id!: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsString()
  check_in!: string;

  @ApiProperty({ example: '2026-07-03' })
  @IsString()
  check_out!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  rooms?: number;
}
