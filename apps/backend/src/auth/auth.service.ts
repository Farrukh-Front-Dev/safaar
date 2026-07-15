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
import { JOBS } from '../jobs/job-names';
import { PostgresService } from '../infrastructure/postgres.service';
import { JobQueueService } from '../infrastructure/job-queue.service';
import { EmailService } from '../infrastructure/email.service';
import { otpStore, type OtpPurpose } from './otp-store';
import { authSessionStore } from './session-store';
import { demoAuthEnabled, signJwt, verifyJwt } from './security';
import { createTotpSetup, verifyTotpCode, type TotpSetup } from './totp';

type DbRow = Record<string, unknown>;

interface AdminUserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  full_name?: string;
  role: Role;
  roles: Role[];
  status: string;
  totp_secret?: string;
  recovery_code_hashes?: string[];
  created_at: string;
  updated_at: string;
}

interface PartnerUserRecord {
  id: string;
  organization_id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

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
    private readonly pg: PostgresService,
    private readonly jobs: JobQueueService,
    private readonly emailService: EmailService,
  ) {}

  sendUserOtp(phone: string) {
    return this.createOtpChallenge(this.normalizePhone(phone), 'user_login');
  }

  sendPartnerOtp(phone: string) {
    return this.createOtpChallenge(this.normalizePhone(phone), 'partner_login');
  }

  async sendPartnerEmailOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!this.isValidEmail(normalizedEmail)) {
      throw this.invalidCredentials();
    }

    await this.assertApprovedPartnerEmail(normalizedEmail);
    const response = this.createOtpChallenge(normalizedEmail, 'partner_login');
    const code =
      response.dev_code ?? otpStore.getDevCode(response.challenge_id);

    const message = {
      to: normalizedEmail,
      subject: 'Safaar hamkor kabineti uchun kirish kodi',
      text: `Safaar hamkor kabinetiga kirish kodingiz: ${code ?? '******'}`,
      html: `<p>Safaar hamkor kabinetiga kirish kodingiz:</p><h2>${code ?? '******'}</h2>`,
    };

    await this.emailService.send(message);
    await this.jobs.add(JOBS.SEND_EMAIL, message, {
      idempotencyKey: `partner-login-email:${response.challenge_id}`,
    });

    return {
      sent: response.sent,
      challenge_id: response.challenge_id,
      expires_in_seconds: response.expires_in_seconds,
      resend_after_seconds: response.resend_after_seconds,
    };
  }

  async verifyUserOtp(
    dto: VerifyOtpDto,
  ): Promise<AuthTokens & { user: unknown }> {
    const phone = this.normalizePhone(dto.phone);
    this.consumeOtp({
      challengeId: dto.challenge_id,
      phone,
      purpose: 'user_login',
      code: dto.code,
    });

    const rows = await this.pg.query<DbRow>(
      `SELECT id::text, phone, status, preferred_language, bonus_balance,
              first_name, last_name, email, phone_verified_at, last_login_at,
              created_at, updated_at
       FROM users
       WHERE phone = $1
       LIMIT 1`,
      [phone],
    );

    let user: DbRow;
    if (rows.length === 0) {
      const id = randomUUID();
      const now = new Date().toISOString();
      await this.pg.query(
        `INSERT INTO users (id, phone, status, preferred_language, bonus_balance, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, phone, 'active', 'uz', 0, now, now],
      );
      user = {
        id,
        phone,
        status: 'active',
        preferred_language: 'uz',
        bonus_balance: 0,
        first_name: null,
        last_name: null,
        email: null,
        phone_verified_at: null,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      };
    } else {
      user = rows[0];
    }

    return {
      ...await this.issueTokens({
        actorId: String(user['id']),
        actorType: 'user',
        role: Role.USER,
      }),
      user,
    };
  }

  async verifyPartnerOtp(dto: VerifyOtpDto): Promise<AuthTokens> {
    const phone = this.normalizePhone(dto.phone);
    this.consumeOtp({
      challengeId: dto.challenge_id,
      phone,
      purpose: 'partner_login',
      code: dto.code,
    });

    return this.issuePartnerTokensByPhone(phone);
  }

  async verifyPartnerEmailOtp(body: Record<string, unknown>): Promise<
    AuthTokens & {
      organization_id: string;
      organizationId: string;
      partner_role: string;
    }
  > {
    const email = this.normalizeEmail(body.email);
    const code = String(body.code ?? '');
    const challengeId = String(
      body.challenge_id ?? body.chalenge_id ?? '',
    ).trim();

    if (!this.isValidEmail(email)) {
      throw this.invalidCredentials();
    }

    this.consumeOtp({
      challengeId,
      phone: email,
      purpose: 'partner_login',
      code,
    });

    return this.issuePartnerTokensByEmail(email);
  }

  async completeProfile(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };

    const rows = await this.pg.query<DbRow>(
      `SELECT id::text, phone, status, preferred_language, bonus_balance,
              first_name, last_name, email, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [currentActor.id],
    );

    if (rows.length === 0) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'User topilmadi',
      });
    }

    const firstName = String(
      body.first_name ?? body.firstName ?? rows[0]['first_name'] ?? '',
    );
    const lastName = String(
      body.last_name ?? body.lastName ?? rows[0]['last_name'] ?? '',
    );
    const email = body.email
      ? String(body.email).toLowerCase()
      : rows[0]['email'];
    const preferredLanguage = ['uz', 'ru', 'en'].includes(
      String(body.preferred_language),
    )
      ? String(body.preferred_language)
      : rows[0]['preferred_language'];
    const now = new Date().toISOString();

    await this.pg.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, email = $3, preferred_language = $4, updated_at = $5
       WHERE id = $6`,
      [firstName, lastName, email, preferredLanguage, now, currentActor.id],
    );

    return {
      ...rows[0],
      first_name: firstName,
      last_name: lastName,
      email,
      preferred_language: preferredLanguage,
      updated_at: now,
    };
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

  async oauthToken(
    provider: 'google' | 'facebook',
    body: Record<string, unknown>,
  ) {
    if (!demoAuthEnabled()) {
      throw new ServiceUnavailableException({
        code: 'OAUTH_PROVIDER_NOT_CONFIGURED',
        message: `${provider} OAuth provider rasmiy verifikatsiyasi ulanmagan`,
      });
    }

    const providerUserId = String(
      body.provider_user_id ?? body.sub ?? `${provider}-demo-id`,
    );

    const rows = await this.pg.query<DbRow>(
      `SELECT id::text, phone, status, preferred_language, bonus_balance,
              first_name, last_name, email, created_at, updated_at
       FROM users
       LIMIT 1`,
    );
    const user = rows[0];
    const social = {
      id: randomUUID(),
      user_id: user['id'],
      provider,
      provider_user_id: providerUserId,
      provider_email: body.email
        ? String(body.email).toLowerCase()
        : user['email'],
      email_verified: Boolean(body.email_verified ?? true),
      created_at: new Date().toISOString(),
    };
    this.socialAccountStore.push(social);
    return {
      ...await this.issueTokens({
        actorId: String(user['id']),
        actorType: 'user',
        role: Role.USER,
      }),
      user,
      social_account: social,
    };
  }

  socialAccounts(actor: RequestActor | undefined) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    return this.socialAccountStore.filter(
      (account) => account['user_id'] === currentActor.id,
    );
  }

  unlinkSocialAccount(actor: RequestActor | undefined, id: string) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
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

    const orgRows = await this.pg.query<DbRow>(
      `SELECT id::text, status
       FROM partner_organizations
       WHERE id = $1
       LIMIT 1`,
      [partnerUser.organization_id],
    );
    const organization = orgRows[0];

    if (!organization || organization['status'] !== 'approved') {
      throw new UnauthorizedException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Hamkor tashkilot faol emas',
      });
    }

    return {
      ...await this.issueTokens({
        actorId: partnerUser.id,
        actorType: 'partner',
        role: Role.PARTNER,
        organizationId: partnerUser.organization_id,
      }),
      organization_id: partnerUser.organization_id,
      partner_role: partnerUser.role,
    };
  }

  async partnerPhoneLogin(body: Record<string, unknown>) {
    const phone = this.normalizePhone(String(body.phone ?? ''));
    if (!phone) {
      throw this.invalidCredentials();
    }

    return this.issuePartnerTokensByPhone(phone);
  }

  async partnerEmailLogin(body: Record<string, unknown>) {
    const email = this.normalizeEmail(body.email);
    if (!this.isValidEmail(email)) {
      throw this.invalidCredentials();
    }

    return this.issuePartnerTokensByEmail(email);
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
      return {
        ...await this.issueTokens({
          actorId: admin.id,
          actorType: 'admin',
          role: admin.role,
          roles: admin.roles,
        }),
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

  async adminVerify2fa(body: Record<string, unknown>) {
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
        message: '2FA kod noto\u2018g\u2018ri',
      });
    }

    this.twoFactorChallenges.delete(challengeId);
    return {
      ...await this.issueTokens({
        actorId: challenge.admin.id,
        actorType: 'admin',
        role: challenge.admin.role,
        roles: challenge.admin.roles,
      }),
      admin: this.publicAdmin(challenge.admin),
    };
  }

  async admin2faSetup(actor: RequestActor | undefined) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'admin',
      role: Role.ADMIN,
      roles: [Role.ADMIN],
    };

    const rows = await this.pg.query<DbRow>(
      `SELECT id::text, email, password_hash, full_name, role, status,
              totp_secret, recovery_code_hashes, created_at, updated_at
       FROM admin_users
       WHERE id = $1
       LIMIT 1`,
      [currentActor.id],
    );

    if (rows.length === 0) {
      throw this.invalidCredentials();
    }

    const admin = rows[0];
    const email = String(admin['email']);
    const setup = createTotpSetup(email);
    const setupId = randomUUID();
    this.pendingTotpSetups.set(setupId, {
      adminId: currentActor.id,
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

  async admin2faConfirm(
    actor: RequestActor | undefined,
    body: Record<string, unknown>,
  ) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'admin',
      role: Role.ADMIN,
      roles: [Role.ADMIN],
    };
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
        message: '2FA kod noto\u2018g\u2018ri',
      });
    }

    const rows = await this.pg.query<DbRow>(
      `SELECT id::text
       FROM admin_users
       WHERE id = $1
       LIMIT 1`,
      [currentActor.id],
    );

    if (rows.length === 0) {
      throw this.invalidCredentials();
    }

    const now = new Date().toISOString();
    await this.pg.query(
      `UPDATE admin_users
       SET totp_secret = $1, recovery_code_hashes = $2, updated_at = $3
       WHERE id = $4`,
      [
        pending.setup.encryptedSecret,
        pending.setup.recoveryCodeHashes,
        now,
        currentActor.id,
      ],
    );

    this.pendingTotpSetups.delete(setupId);
    return { enabled: true };
  }

  async admin2faDisable(actor: RequestActor | undefined) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'admin',
      role: Role.ADMIN,
      roles: [Role.ADMIN],
    };

    const rows = await this.pg.query<DbRow>(
      `SELECT id::text
       FROM admin_users
       WHERE id = $1
       LIMIT 1`,
      [currentActor.id],
    );

    if (rows.length === 0) {
      throw this.invalidCredentials();
    }

    const now = new Date().toISOString();
    await this.pg.query(
      `UPDATE admin_users
       SET totp_secret = NULL, recovery_code_hashes = '{}', updated_at = $1
       WHERE id = $2`,
      [now, currentActor.id],
    );

    await authSessionStore.revokeActor(currentActor.id);
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

  async refresh(body: Record<string, unknown>) {
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
      await authSessionStore.rotate(
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

  async logout(actor: RequestActor | undefined) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    if (currentActor.sessionId) {
      await authSessionStore.revokeSession(currentActor.sessionId);
    }
    return { actor_id: currentActor.id, logged_out: true };
  }

  async logoutAll(actor: RequestActor | undefined) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const revoked = await authSessionStore.revokeActor(currentActor.id);
    return { actor_id: currentActor.id, revoked_sessions: revoked };
  }

  async sessions(actor: RequestActor | undefined) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const sessionList = await authSessionStore.listForActor(currentActor.id);
    return sessionList.map((session) => ({
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

  async revokeSession(actor: RequestActor | undefined, id: string) {
    const currentActor = actor ?? {
      id: '00000000-0000-0000-0000-000000000000',
      actorType: 'user',
      role: Role.USER,
      roles: [Role.USER],
    };
    const session = await authSessionStore.get(id);

    if (!session || session.actorId !== currentActor.id) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_REVOKED',
        message: 'Sessiya topilmadi',
      });
    }

    await authSessionStore.revokeSession(id);
    return { id, actor_id: currentActor.id, revoked: true };
  }

  private createOtpChallenge(identifier: string, purpose: OtpPurpose) {
    try {
      const challenge = otpStore.create(identifier, purpose);
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
          message: 'OTP so\u2018rovlar limiti oshdi',
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
          code === 'OTP_EXPIRED'
            ? 'OTP muddati tugagan'
            : 'OTP noto\u2018g\u2018ri',
      });
    }
  }

  private async issueTokens(input: IssueTokenInput): Promise<AuthTokens> {
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const refreshJti = randomUUID();
    const tokens = this.signTokenPair(input, sessionId, familyId, refreshJti);

    await authSessionStore.create({
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
    const rows = await this.pg.query<DbRow>(
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
        status: String(rows[0]['status']),
        role: 'owner',
        created_at: String(rows[0]['created_at']),
        updated_at: String(rows[0]['updated_at']),
      };
    }

    return undefined;
  }

  private async issuePartnerTokensByPhone(phone: string): Promise<
    AuthTokens & {
      organization_id: string;
      partner_role: string;
    }
  > {
    const rows = await this.pg.query<DbRow>(
      `
        select
          po.id::text as organization_id,
          po.status::text as organization_status,
          pu.id::text as user_id,
          pu.status::text as user_status,
          'owner'::text as partner_role
        from partner_organizations po
        left join partner_users pu
          on pu.organization_id = po.id
         and pu.deleted_at is null
        where regexp_replace(po.phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g')
        order by pu.created_at asc nulls last, po.created_at desc
        limit 1
      `,
      [phone],
    );
    const row = rows[0];

    if (!row || row['organization_status'] !== 'approved') {
      throw new UnauthorizedException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Hamkor tashkilot faol emas',
      });
    }

    if (row['user_status'] && row['user_status'] !== 'active') {
      throw this.invalidCredentials();
    }

    const organizationId = String(row['organization_id']);
    const actorId = row['user_id'] ? String(row['user_id']) : organizationId;

    return {
      ...await this.issueTokens({
        actorId,
        actorType: 'partner',
        role: Role.PARTNER,
        organizationId,
      }),
      organization_id: organizationId,
      partner_role: String(row['partner_role'] ?? 'owner'),
    };
  }

  private async issuePartnerTokensByEmail(email: string): Promise<
    AuthTokens & {
      organization_id: string;
      organizationId: string;
      partner_role: string;
    }
  > {
    const rows = await this.pg.query<DbRow>(
      `
        select
          po.id::text as organization_id,
          po.status::text as organization_status,
          pu.id::text as user_id,
          pu.status::text as user_status,
          'owner'::text as partner_role
        from partner_organizations po
        left join partner_users pu
          on pu.organization_id = po.id
         and pu.deleted_at is null
        where lower(po.email) = lower($1)
           or lower(pu.email) = lower($1)
        order by pu.created_at asc nulls last, po.created_at desc
        limit 1
      `,
      [email],
    );
    const row = rows[0];

    if (!row || row['organization_status'] !== 'approved') {
      throw new UnauthorizedException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Hamkor tashkilot faol emas',
      });
    }

    if (row['user_status'] && row['user_status'] !== 'active') {
      throw this.invalidCredentials();
    }

    const organizationId = String(row['organization_id']);
    const actorId = row['user_id'] ? String(row['user_id']) : organizationId;

    return {
      ...await this.issueTokens({
        actorId,
        actorType: 'partner',
        role: Role.PARTNER,
        organizationId,
      }),
      organization_id: organizationId,
      organizationId,
      partner_role: String(row['partner_role'] ?? 'owner'),
    };
  }

  private async assertApprovedPartnerEmail(email: string) {
    const rows = await this.pg.query<DbRow>(
      `
        select po.id::text
        from partner_organizations po
        left join partner_users pu
          on pu.organization_id = po.id
         and pu.deleted_at is null
        where po.status = 'approved'
          and (lower(po.email) = lower($1) or lower(pu.email) = lower($1))
        limit 1
      `,
      [email],
    );

    if (!rows[0]) {
      throw new UnauthorizedException({
        code: 'PARTNER_NOT_ACTIVE',
        message: 'Hamkor tashkilot faol emas',
      });
    }
  }

  private async findAdminUser(
    login: string,
  ): Promise<AdminUserRecord | undefined> {
    const email = login === 'admin' ? 'admin@uzbron.uz' : login;
    const rows = await this.pg.query<DbRow>(
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
        status: String(rows[0]['status']),
        totp_secret: rows[0]['totp_secret']
          ? String(rows[0]['totp_secret'])
          : undefined,
        created_at: String(rows[0]['created_at']),
        updated_at: String(rows[0]['updated_at']),
      };
    }

    return undefined;
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
      message: 'Login/parol noto\u2018g\u2018ri',
    });
  }

  private normalizePhone(phone: string): string {
    const digits = String(phone ?? '').replace(/\D/g, '');
    return digits.startsWith('998') ? `+${digits}` : `+998${digits}`;
  }

  private normalizeEmail(email: unknown): string {
    return String(email ?? '')
      .trim()
      .toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
