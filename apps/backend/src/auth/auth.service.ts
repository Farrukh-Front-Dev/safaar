import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import {
  Role,
  type ActorType,
  type VerifyOtpDto,
  type AuthTokens,
} from '@agoda/types';
import type { RequestActor } from '../common/actor';
import {
  type AdminUserRecord,
  InMemoryDbService,
  type PartnerUserRecord,
} from '../infrastructure/in-memory-db.service';
import { PostgresService } from '../infrastructure/postgres.service';
import { otpStore, type OtpPurpose } from './otp-store';
import { authSessionStore } from './session-store';
import {
  demoAuthEnabled,
  inMemoryDataEnabled,
  signJwt,
  verifyJwt,
} from './security';
import { createTotpSetup, verifyTotpCode, type TotpSetup } from './totp';

type DbRow = Record<string, unknown>;

interface IssueTokenInput {
  actorId: string;
  actorType: ActorType;
  role: Role;
  roles?: Role[];
  organizationId?: string | null;
}

interface TwoFactorChallenge {
  id: string;
  admin: AdminUserRecord;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly socialAccountStore: Array<Record<string, unknown>> = [];
  private readonly twoFactorChallenges = new Map<string, TwoFactorChallenge>();
  private readonly pendingTotpSetups = new Map<
    string,
    { adminId: string; setup: TotpSetup; expiresAt: number }
  >();

  constructor(
    private readonly db: InMemoryDbService,
    private readonly postgres: PostgresService,
  ) {}

  sendUserOtp(phone: string) {
    return this.createOtpChallenge(phone, 'user_login');
  }

  sendPartnerOtp(phone: string) {
    return this.createOtpChallenge(phone, 'partner_login');
  }

  verifyUserOtp(dto: VerifyOtpDto): AuthTokens & { user: unknown } {
    const phone = this.normalizePhone(dto.phone);
    this.consumeOtp({
      challengeId: dto.challenge_id,
      phone,
      purpose: 'user_login',
      code: dto.code,
    });

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
      ...this.issueTokens({
        actorId: user.id,
        actorType: 'user',
        role: Role.USER,
      }),
      user,
    };
  }

  verifyPartnerOtp(dto: VerifyOtpDto): AuthTokens {
    const phone = this.normalizePhone(dto.phone);
    this.consumeOtp({
      challengeId: dto.challenge_id,
      phone,
      purpose: 'partner_login',
      code: dto.code,
    });

    if (!inMemoryDataEnabled()) {
      throw new ServiceUnavailableException({
        code: 'PARTNER_OTP_NOT_CONFIGURED',
        message: 'Partner OTP login provider ulanmagan',
      });
    }

    return this.issueTokens({
      actorId: 'demo-partner-user-id',
      actorType: 'partner',
      role: Role.PARTNER,
      organizationId: 'demo-partner-org-id',
    });
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
    if (!demoAuthEnabled()) {
      throw new ServiceUnavailableException({
        code: 'OAUTH_PROVIDER_NOT_CONFIGURED',
        message: `${provider} OAuth provider rasmiy verifikatsiyasi ulanmagan`,
      });
    }

    return {
      provider,
      redirect_url: `https://api.uzbron.uz/v1/auth/${provider}/callback?state=demo-state`,
      state: 'demo-state',
    };
  }

  oauthCallback(provider: 'google' | 'facebook') {
    return this.oauthToken(provider, {
      provider_user_id: `${provider}-demo-id`,
    });
  }

  oauthToken(provider: 'google' | 'facebook', body: Record<string, unknown>) {
    if (!demoAuthEnabled()) {
      throw new ServiceUnavailableException({
        code: 'OAUTH_PROVIDER_NOT_CONFIGURED',
        message: `${provider} OAuth provider rasmiy verifikatsiyasi ulanmagan`,
      });
    }

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
      ...this.issueTokens({
        actorId: user.id,
        actorType: 'user',
        role: Role.USER,
      }),
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

  async partnerLogin(body: Record<string, unknown>) {
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    const partnerUser = await this.findPartnerUser(email);

    if (
      !partnerUser ||
      partnerUser.status !== 'active' ||
      !(await this.verifyPassword(partnerUser.password_hash, password))
    ) {
      throw this.invalidCredentials();
    }

    const organization = this.db.partnerOrganizations.find(
      (item) => item.id === partnerUser.organization_id,
    );
    if (!organization || organization.status !== 'approved') {
      throw new UnauthorizedException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Hamkor tashkilot faol emas',
      });
    }

    return {
      ...this.issueTokens({
        actorId: partnerUser.id,
        actorType: 'partner',
        role: Role.PARTNER,
        organizationId: partnerUser.organization_id,
      }),
      organization_id: partnerUser.organization_id,
      partner_role: partnerUser.role,
    };
  }

  async adminLogin(body: Record<string, unknown>) {
    const login = String(body.username ?? body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    const admin = await this.findAdminUser(login);

    if (
      !admin ||
      admin.status !== 'active' ||
      !(await this.verifyPassword(admin.password_hash, password))
    ) {
      throw this.invalidCredentials();
    }

    if (!admin.totp_secret) {
      if (!inMemoryDataEnabled()) {
        throw new UnauthorizedException({
          code: 'AUTH_2FA_REQUIRED',
          message: 'Admin uchun 2FA sozlanishi majburiy',
        });
      }

      return {
        ...this.issueTokens({
          actorId: admin.id,
          actorType: 'admin',
          role: admin.role,
          roles: admin.roles,
        }),
        requires_2fa: false,
        admin: this.publicAdmin(admin),
      };
    }

    const challengeId = randomUUID();
    this.twoFactorChallenges.set(challengeId, {
      id: challengeId,
      admin,
      expiresAt: Date.now() + 5 * 60_000,
    });

    return {
      challenge_id: challengeId,
      requires_2fa: true,
      expires_in_seconds: 300,
    };
  }

  adminVerify2fa(body: Record<string, unknown>) {
    const challengeId = String(body.challenge_id ?? body.chalenge_id ?? '');
    const code = String(body.code ?? '');
    const challenge = this.twoFactorChallenges.get(challengeId);

    if (!challenge || challenge.expiresAt <= Date.now()) {
      throw new UnauthorizedException({
        code: 'AUTH_2FA_EXPIRED',
        message: '2FA challenge muddati tugagan',
      });
    }

    if (
      !challenge.admin.totp_secret ||
      !verifyTotpCode(challenge.admin.totp_secret, code)
    ) {
      throw new UnauthorizedException({
        code: 'AUTH_2FA_INVALID',
        message: '2FA kod noto‘g‘ri',
      });
    }

    this.twoFactorChallenges.delete(challengeId);
    return {
      ...this.issueTokens({
        actorId: challenge.admin.id,
        actorType: 'admin',
        role: challenge.admin.role,
        roles: challenge.admin.roles,
      }),
      admin: this.publicAdmin(challenge.admin),
    };
  }

  admin2faSetup(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    const admin = this.db.adminUsers.find(
      (item) => item.id === currentActor.id,
    );
    if (!admin) {
      throw this.invalidCredentials();
    }

    const setup = createTotpSetup(admin.email);
    const setupId = randomUUID();
    this.pendingTotpSetups.set(setupId, {
      adminId: admin.id,
      setup,
      expiresAt: Date.now() + 10 * 60_000,
    });

    return {
      setup_id: setupId,
      otpauth_url: setup.otpauthUrl,
      secret: setup.secret,
      recovery_codes: setup.recoveryCodes,
      expires_in_seconds: 600,
    };
  }

  admin2faConfirm(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = this.db.actorOrDemo(actor);
    const setupId = String(body.setup_id ?? '');
    const code = String(body.code ?? '');
    const pending = this.pendingTotpSetups.get(setupId);

    if (
      !pending ||
      pending.adminId !== currentActor.id ||
      pending.expiresAt <= Date.now()
    ) {
      throw new UnauthorizedException({
        code: 'AUTH_2FA_EXPIRED',
        message: '2FA setup muddati tugagan',
      });
    }

    if (!verifyTotpCode(pending.setup.encryptedSecret, code)) {
      throw new UnauthorizedException({
        code: 'AUTH_2FA_INVALID',
        message: '2FA kod noto‘g‘ri',
      });
    }

    const admin = this.db.adminUsers.find(
      (item) => item.id === currentActor.id,
    );
    if (!admin) {
      throw this.invalidCredentials();
    }

    admin.totp_secret = pending.setup.encryptedSecret;
    admin.recovery_code_hashes = pending.setup.recoveryCodeHashes;
    admin.updated_at = this.db.now();
    this.pendingTotpSetups.delete(setupId);

    return { enabled: true };
  }

  admin2faDisable(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    const admin = this.db.adminUsers.find(
      (item) => item.id === currentActor.id,
    );
    if (!admin) {
      throw this.invalidCredentials();
    }

    admin.totp_secret = undefined;
    admin.recovery_code_hashes = [];
    admin.updated_at = this.db.now();
    authSessionStore.revokeActor(admin.id);
    return { disabled: true, sessions_revoked: true };
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
    const payload = verifyJwt(refreshToken, 'refresh');

    if (!payload) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_INVALID',
        message: 'Refresh token yaroqsiz',
      });
    }

    const nextRefreshJti = randomUUID();
    const nextTokens = this.signTokenPair(
      {
        actorId: payload.sub,
        actorType: payload.actor_type,
        role: payload.role,
        roles: payload.roles,
        organizationId: payload.organization_id,
      },
      payload.session_id,
      payload.family_id ?? randomUUID(),
      nextRefreshJti,
    );

    try {
      authSessionStore.rotate(
        payload.session_id,
        refreshToken,
        payload.jti,
        nextTokens.refreshToken,
        nextRefreshJti,
      );
    } catch (error) {
      const code =
        error instanceof Error && error.message === 'AUTH_REFRESH_REUSED'
          ? 'AUTH_REFRESH_REUSED'
          : 'AUTH_SESSION_REVOKED';
      throw new UnauthorizedException({
        code,
        message: 'Sessiya topilmadi yoki bekor qilingan',
      });
    }

    return nextTokens;
  }

  logout(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    if (currentActor.sessionId) {
      authSessionStore.revokeSession(currentActor.sessionId);
    }
    return { actor_id: currentActor.id, logged_out: true };
  }

  logoutAll(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    const revoked = authSessionStore.revokeActor(currentActor.id);
    return { actor_id: currentActor.id, revoked_sessions: revoked };
  }

  sessions(actor: RequestActor | undefined) {
    const currentActor = this.db.actorOrDemo(actor);
    return authSessionStore.listForActor(currentActor.id).map((session) => ({
      id: session.id,
      actor_id: session.actorId,
      role: session.role,
      user_agent: session.userAgent,
      ip_address: session.ipAddress,
      created_at: session.createdAt,
      expires_at: new Date(session.refreshExpiresAt).toISOString(),
      revoked_at: session.revokedAt,
      current: session.id === currentActor.sessionId,
    }));
  }

  revokeSession(actor: RequestActor | undefined, id: string) {
    const currentActor = this.db.actorOrDemo(actor);
    const session = authSessionStore.get(id);

    if (!session || session.actorId !== currentActor.id) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_REVOKED',
        message: 'Sessiya topilmadi',
      });
    }

    authSessionStore.revokeSession(id);
    return { id, actor_id: currentActor.id, revoked: true };
  }

  private createOtpChallenge(phone: string, purpose: OtpPurpose) {
    const normalizedPhone = this.normalizePhone(phone);

    try {
      const challenge = otpStore.create(normalizedPhone, purpose);
      const response: {
        sent: boolean;
        challenge_id: string;
        expires_in_seconds: number;
        resend_after_seconds: number;
        dev_code?: string;
      } = {
        sent: true,
        challenge_id: challenge.id,
        expires_in_seconds: 300,
        resend_after_seconds: 60,
      };

      if (demoAuthEnabled()) {
        response.dev_code = otpStore.getDevCode(challenge.id);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'OTP_RATE_LIMITED') {
        throw new BadRequestException({
          code: 'OTP_RATE_LIMITED',
          message: 'OTP so‘rovlar limiti oshdi',
        });
      }
      throw error;
    }
  }

  private consumeOtp(input: {
    challengeId?: string;
    phone: string;
    purpose: OtpPurpose;
    code: string;
  }): void {
    try {
      otpStore.consume(input);
    } catch (error) {
      const code =
        error instanceof Error && error.message === 'OTP_EXPIRED'
          ? 'OTP_EXPIRED'
          : 'OTP_INVALID';
      throw new UnauthorizedException({
        code,
        message:
          code === 'OTP_EXPIRED' ? 'OTP muddati tugagan' : 'OTP noto‘g‘ri',
      });
    }
  }

  private issueTokens(input: IssueTokenInput): AuthTokens {
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const refreshJti = randomUUID();
    const tokens = this.signTokenPair(input, sessionId, familyId, refreshJti);

    authSessionStore.create({
      sessionId,
      familyId,
      actorId: input.actorId,
      actorType: input.actorType,
      role: input.role,
      roles: input.roles?.length ? input.roles : [input.role],
      organizationId: input.organizationId,
      refreshToken: tokens.refreshToken,
      refreshJti,
      userAgent: 'api',
      ipAddress: '0.0.0.0',
    });

    return tokens;
  }

  private signTokenPair(
    input: IssueTokenInput,
    sessionId: string,
    familyId: string,
    refreshJti: string,
  ): AuthTokens {
    const roles = input.roles?.length ? input.roles : [input.role];
    const basePayload = {
      sub: input.actorId,
      role: input.role,
      roles,
      actor_type: input.actorType,
      organization_id: input.organizationId ?? null,
      session_id: sessionId,
      family_id: familyId,
    };

    return {
      accessToken: signJwt({ ...basePayload, jti: randomUUID() }, 'access'),
      refreshToken: signJwt({ ...basePayload, jti: refreshJti }, 'refresh'),
    };
  }

  private async findPartnerUser(
    email: string,
  ): Promise<PartnerUserRecord | undefined> {
    const rows = await this.postgres.tryQuery<DbRow>(
      `
        select pu.id::text, pu.organization_id::text, pu.email, pu.password_hash,
               pu.full_name, pu.status, pu.created_at, pu.updated_at
        from partner_users pu
        where lower(pu.email) = lower($1)
        limit 1
      `,
      [email],
    );

    if (rows?.[0]) {
      return {
        id: String(rows[0]['id']),
        organization_id: String(rows[0]['organization_id']),
        email: String(rows[0]['email']),
        password_hash: String(rows[0]['password_hash']),
        full_name: rows[0]['full_name']
          ? String(rows[0]['full_name'])
          : undefined,
        status: String(rows[0]['status']) as PartnerUserRecord['status'],
        role: 'owner',
        created_at: String(rows[0]['created_at']),
        updated_at: String(rows[0]['updated_at']),
      };
    }

    return inMemoryDataEnabled()
      ? this.db.findPartnerUserByEmail(email)
      : undefined;
  }

  private async findAdminUser(
    login: string,
  ): Promise<AdminUserRecord | undefined> {
    const email = login === 'admin' ? 'admin@uzbron.uz' : login;
    const rows = await this.postgres.tryQuery<DbRow>(
      `
        select id::text, email, password_hash, full_name, role, status,
               totp_secret, created_at, updated_at
        from admin_users
        where lower(email) = lower($1)
        limit 1
      `,
      [email],
    );

    if (rows?.[0]) {
      const role = this.normalizeAdminRole(rows[0]['role']);
      return {
        id: String(rows[0]['id']),
        email: String(rows[0]['email']),
        username: String(rows[0]['email']).split('@')[0],
        password_hash: String(rows[0]['password_hash']),
        full_name: rows[0]['full_name']
          ? String(rows[0]['full_name'])
          : undefined,
        role,
        roles: [role],
        status: String(rows[0]['status']) as AdminUserRecord['status'],
        totp_secret: rows[0]['totp_secret']
          ? String(rows[0]['totp_secret'])
          : undefined,
        created_at: String(rows[0]['created_at']),
        updated_at: String(rows[0]['updated_at']),
      };
    }

    return inMemoryDataEnabled() ? this.db.findAdminByLogin(login) : undefined;
  }

  private normalizeAdminRole(value: unknown): Role {
    const role = String(value ?? Role.ADMIN)
      .trim()
      .toUpperCase()
      .replace(/-/g, '_');
    const aliases: Record<string, Role> = {
      SUPER_ADMIN: Role.SUPER_ADMIN,
      ADMIN: Role.ADMIN,
      FINANCE_ADMIN: Role.FINANCE_ADMIN,
      CONTENT_ADMIN: Role.CONTENT_ADMIN,
      SUPPORT_ADMIN: Role.SUPPORT_ADMIN,
      MODERATOR: Role.MODERATOR,
    };
    return aliases[role] ?? Role.ADMIN;
  }

  private publicAdmin(admin: AdminUserRecord) {
    return {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      status: admin.status,
      has_2fa: Boolean(admin.totp_secret),
    };
  }

  private async verifyPassword(
    hash: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  private invalidCredentials() {
    return new UnauthorizedException({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Login/parol noto‘g‘ri',
    });
  }

  private normalizePhone(phone: string): string {
    const digits = String(phone ?? '').replace(/\D/g, '');
    return digits.startsWith('998') ? `+${digits}` : `+998${digits}`;
  }
}
