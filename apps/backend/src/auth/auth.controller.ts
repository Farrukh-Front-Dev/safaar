import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@agoda/types';
import { CurrentActor, type RequestActor } from '../common/actor';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthService } from './auth.service';
import {
  CompleteProfileDto,
  ForgotPasswordDto,
  LoginDto,
  OAuthTokenDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendOtpDto,
  Verify2faDto,
  VerifyOtpRequestDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/send-otp')
  requestOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendUserOtp(dto.phone);
  }

  @Post('user/verify-otp')
  verifyOtp(@Body() dto: VerifyOtpRequestDto) {
    return this.authService.verifyUserOtp(dto);
  }

  @Post('user/complete-profile')
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  completeProfile(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: CompleteProfileDto,
  ) {
    return this.authService.completeProfile(
      actor,
      body as unknown as Record<string, unknown>,
    );
  }

  @Get('google')
  googleRedirect() {
    return this.authService.oauthRedirect('google');
  }

  @Get('google/callback')
  googleCallback() {
    return this.authService.oauthCallback('google');
  }

  @Post('google/token')
  googleToken(@Body() body: OAuthTokenDto) {
    return this.authService.oauthToken(
      'google',
      body as unknown as Record<string, unknown>,
    );
  }

  @Get('facebook')
  facebookRedirect() {
    return this.authService.oauthRedirect('facebook');
  }

  @Get('facebook/callback')
  facebookCallback() {
    return this.authService.oauthCallback('facebook');
  }

  @Post('facebook/token')
  facebookToken(@Body() body: OAuthTokenDto) {
    return this.authService.oauthToken(
      'facebook',
      body as unknown as Record<string, unknown>,
    );
  }

  @Get('social-accounts')
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  socialAccounts(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.socialAccounts(actor);
  }

  @Delete('social-accounts/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  unlinkSocialAccount(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.authService.unlinkSocialAccount(actor, id);
  }

  @Post('partner/login')
  partnerLogin(@Body() body: LoginDto) {
    return this.authService.partnerLogin(
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('partner/forgot-password')
  partnerForgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.passwordResetRequest(
      'partner',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('partner/reset-password')
  partnerResetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.passwordResetConfirm(
      'partner',
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('admin/login')
  adminLogin(@Body() body: LoginDto) {
    return this.authService.adminLogin(
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('admin/verify-2fa')
  adminVerify2fa(@Body() body: Verify2faDto) {
    return this.authService.adminVerify2fa(
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body as unknown as Record<string, unknown>);
  }

  @Post('logout')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  logout(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.logout(actor);
  }

  @Post('logout-all')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  logoutAll(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.logoutAll(actor);
  }

  @Get('sessions')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  sessions(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.sessions(actor);
  }

  @Delete('sessions/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  revokeSession(
    @CurrentActor() actor: RequestActor | undefined,
    @Param('id') id: string,
  ) {
    return this.authService.revokeSession(actor, id);
  }
}
