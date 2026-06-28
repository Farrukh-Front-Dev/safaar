import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { Role, type VerifyOtpDto, type AuthTokens } from '@agoda/types';
import type { RequestActor } from '../common/actor';
import { InMemoryDbService } from '../infrastructure/in-memory-db.service';

/**
 * Autentifikatsiya xizmati.
 * Skeleton: SMS OTP (Eskiz.uz / PlayMobile) va JWT integratsiyasi
 * keyingi bosqichda qo'shiladi.
 */
@Injectable()
export class AuthService {
  private readonly otpByPhone = new Map<
    string,
    { hash: string; attempts: number; expiresAt: number }
  >();
  private readonly sessionsStore: Array<Record<string, unknown>> = [];
  private readonly socialAccountStore: Array<Record<string, unknown>> = [];

  constructor(private readonly db: InMemoryDbService) {}

  /** Telefon raqamga OTP kod yuborish. */
  sendUserOtp(phone: string): {
    sent: boolean;
    expires_in_seconds: number;
    dev_code?: string;
  } {
    const normalizedPhone = this.normalizePhone(phone);
    const code =
      process.env.NODE_ENV === 'production' ? this.randomOtp() : '111111';
    this.otpByPhone.set(normalizedPhone, {
      hash: this.hash(code),
      attempts: 0,
      expiresAt: Date.now() + 5 * 60_000,
    });

    return {
      sent: true,
      expires_in_seconds: 300,
      dev_code: process.env.NODE_ENV === 'production' ? undefined : code,
    };
  }

  /** OTP kodni tekshirish va token qaytarish. */
  verifyUserOtp(dto: VerifyOtpDto): AuthTokens & { user: unknown } {
    const phone = this.normalizePhone(dto.phone);
    const otp = this.otpByPhone.get(phone);

    if (!otp || otp.expiresAt < Date.now()) {
      throw new UnauthorizedException({
        code: 'OTP_EXPIRED',
        message: 'OTP muddati tugagan',
      });
    }

    otp.attempts += 1;

    if (otp.attempts > 5 || otp.hash !== this.hash(dto.code)) {
      throw new UnauthorizedException({
        code: 'OTP_INVALID',
        message: 'OTP noto‘g‘ri',
      });
    }

    this.otpByPhone.delete(phone);
    let user = this.db.users.find((item) => item.phone === phone);
    if (!user) {
      user = {
        id: this.db.id('user'),
        phone,
        status: 'active',
        preferred_language: 'uz',
        bonus_balance: 0,
        created_at: this.db.now(),
        updated_at: this.db.now(),
      };
      this.db.users.push(user);
    }

    return {
      ...this.issueTokens(user.id, Role.USER),
      user,
    };
  }

  completeProfile(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.db.actorOrDemo(actor);
    const user = this.db.findUser(currentActor.id);

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'User topilmadi',
      });
    }

    user.first_name = String(
      body.first_name ?? body.firstName ?? user.first_name ?? '',
    );
    user.last_name = String(
      body.last_name ?? body.lastName ?? user.last_name ?? '',
    );
    user.email = body.email ? String(body.email).toLowerCase() : user.email;
    user.preferred_language = ['uz', 'ru', 'en'].includes(
      String(body.preferred_language),
    )
      ? (String(body.preferred_language) as 'uz' | 'ru' | 'en')
      : user.preferred_language;
    user.updated_at = this.db.now();

    return user;
  }

  oauthRedirect(provider: 'google' | 'facebook') {
    return {
      provider,
      redirect_url: `https://api.uzbron.uz/v1/auth/${provider}/callback?state=mock-state`,
      state: 'mock-state',
    };
  }

  oauthCallback(provider: 'google' | 'facebook') {
    return this.oauthToken(provider, {
      provider_user_id: `${provider}-demo-id`,
    });
  }

  oauthToken(provider: 'google' | 'facebook', body: Record<string, unknown>) {
    const providerUserId = String(
      body.provider_user_id ?? body.sub ?? `${provider}-demo-id`,
    );
    const user = this.db.users[0];
    const social = {
      id: this.db.id('social'),
      user_id: user.id,
      provider,
      provider_user_id: providerUserId,
      provider_email: body.email
        ? String(body.email).toLowerCase()
        : user.email,
      email_verified: Boolean(body.email_verified ?? true),
      created_at: this.db.now(),
    };
    this.socialAccountStore.push(social);
    return {
      ...this.issueTokens(user.id, Role.USER),
      user,
      social_account: social,
    };
  }

  socialAccounts(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.socialAccountStore.filter(
      (account) => account['user_id'] === currentActor.id,
    );
  }

  unlinkSocialAccount(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const index = this.socialAccountStore.findIndex(
      (account) =>
        account['id'] === id && account['user_id'] === currentActor.id,
    );

    if (index >= 0) {
      const [removed] = this.socialAccountStore.splice(index, 1);
      return removed;
    }

    return { id, deleted: true };
  }

  partnerLogin(body: Record<string, unknown>) {
    this.assertDemoPassword(body);
    return {
      ...this.issueTokens('demo-partner-user-id', Role.PARTNER),
      organization_id: 'demo-partner-org-id',
      partner_role: 'owner',
    };
  }

  adminLogin(body: Record<string, unknown>) {
    this.assertDemoPassword(body);
    return {
      challenge_id: randomUUID(),
      requires_2fa: true,
      expires_in_seconds: 300,
      hint: 'Development uchun 2FA kodi: 000000',
    };
  }

  adminVerify2fa(body: Record<string, unknown>) {
    if (String(body.code ?? '') !== '000000') {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: '2FA kod noto‘g‘ri',
      });
    }

    return this.issueTokens('demo-admin-id', Role.SUPER_ADMIN);
  }

  passwordResetRequest(actorType: 'partner', body: Record<string, unknown>) {
    return {
      actor_type: actorType,
      email: String(body.email ?? '').toLowerCase(),
      reset_sent: true,
      expires_in_seconds: 1800,
    };
  }

  passwordResetConfirm(actorType: 'partner', body: Record<string, unknown>) {
    return {
      actor_type: actorType,
      reset: Boolean(body.token && body.password),
    };
  }

  refresh(body: Record<string, unknown>) {
    const refreshToken = String(body.refreshToken ?? body.refresh_token ?? '');
    const session = this.sessionsStore.find(
      (item) => item['refreshToken'] === refreshToken,
    );

    if (!session) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_REVOKED',
        message: 'Sessiya topilmadi yoki bekor qilingan',
      });
    }

    return this.issueTokens(
      String(session['actor_id']),
      session['role'] as Role,
    );
  }

  logout(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return { actor_id: currentActor.id, logged_out: true };
  }

  logoutAll(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return { actor_id: currentActor.id, revoked_sessions: true };
  }

  sessions(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return this.sessionsStore.filter(
      (session) => session['actor_id'] === currentActor.id,
    );
  }

  revokeSession(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    return {
      id,
      actor_id: currentActor.id,
      revoked: true,
    };
  }

  private issueTokens(actorId: string, role: Role): AuthTokens {
    const sessionId = randomUUID();
    const accessToken = `mock-access.${actorId}.${role}.${sessionId}`;
    const refreshToken = `mock-refresh.${actorId}.${sessionId}`;
    this.sessionsStore.push({
      id: sessionId,
      actor_id: actorId,
      role,
      refreshToken,
      user_agent: 'development',
      ip: '127.0.0.1',
      created_at: this.db.now(),
      expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private assertDemoPassword(body: Record<string, unknown>) {
    const password = String(body.password ?? '');
    if (!password || password !== 'password') {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Login/parol noto‘g‘ri',
      });
    }
  }

  private normalizePhone(phone: string): string {
    const digits = String(phone ?? '').replace(/\D/g, '');
    return digits.startsWith('998') ? `+${digits}` : `+998${digits}`;
  }

  private randomOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
