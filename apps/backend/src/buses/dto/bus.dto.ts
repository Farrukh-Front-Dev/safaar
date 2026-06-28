import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class BusQuoteDto {
  @ApiProperty({ type: [String], example: ['1', '2'] })
  @IsArray()
  @IsString({ each: true })
  seats!: string[];
}
