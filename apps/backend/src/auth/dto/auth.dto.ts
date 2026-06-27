import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class VerifyOtpRequestDto extends SendOtpDto {
  @ApiProperty({ example: '111111' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class CompleteProfileDto {
  @ApiPropertyOptional({ example: 'Laziz' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Shakarov' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'user@uzbron.uz' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['uz', 'ru', 'en'] })
  @IsOptional()
  @IsIn(['uz', 'ru', 'en'])
  preferred_language?: 'uz' | 'ru' | 'en';
}

export class OAuthTokenDto {
  @ApiPropertyOptional({ example: 'google-user-id' })
  @IsOptional()
  @IsString()
  provider_user_id?: string;

  @ApiPropertyOptional({ example: 'user@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'partner@uzbron.uz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'partner@uzbron.uz' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class Verify2faDto {
  @ApiProperty({ example: '000000' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}
