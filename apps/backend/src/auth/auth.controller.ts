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
  AdminLoginDto,
  CompleteProfileDto,
  ForgotPasswordDto,
  LoginDto,
  OAuthTokenDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendOtpDto,
  TotpSetupConfirmDto,
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

  @Post('otp/request')
  requestOtpAlias(@Body() dto: SendOtpDto) {
    return this.authService.sendPartnerOtp(dto.phone);
  }

  @Post('otp/verify')
  verifyOtpAlias(@Body() dto: VerifyOtpRequestDto) {
    return this.authService.verifyPartnerOtp(dto);
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
  adminLogin(@Body() body: AdminLoginDto) {
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

  @Post('admin/2fa/setup')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  admin2faSetup(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.admin2faSetup(actor);
  }

  @Post('admin/2fa/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  admin2faConfirm(
    @CurrentActor() actor: RequestActor | undefined,
    @Body() body: TotpSetupConfirmDto,
  ) {
    return this.authService.admin2faConfirm(
      actor,
      body as unknown as Record<string, unknown>,
    );
  }

  @Post('admin/2fa/disable')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  admin2faDisable(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.admin2faDisable(actor);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body as unknown as Record<string, unknown>);
  }

  @Post('user/refresh')
  userRefresh(@Body() body: RefreshTokenDto) {
    return this.refresh(body);
  }

  @Post('partner/refresh')
  partnerRefresh(@Body() body: RefreshTokenDto) {
    return this.refresh(body);
  }

  @Post('admin/refresh')
  adminRefresh(@Body() body: RefreshTokenDto) {
    return this.refresh(body);
  }

  @Post('logout')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.PARTNER, Role.ADMIN, Role.SUPER_ADMIN)
  logout(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.logout(actor);
  }

  @Post('user/logout')
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  userLogout(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.logout(actor);
  }

  @Post('partner/logout')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER)
  partnerLogout(@CurrentActor() actor: RequestActor | undefined) {
    return this.authService.logout(actor);
  }

  @Post('admin/logout')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminLogout(@CurrentActor() actor: RequestActor | undefined) {
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
