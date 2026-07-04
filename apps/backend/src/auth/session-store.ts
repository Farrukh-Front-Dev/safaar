import { Role, type ActorType } from '@agoda/types';
import { hashSecret, jwtSecurityConfig } from './security';

export interface AuthSessionRecord {
  id: string;
  actorId: string;
  actorType: ActorType;
  role: Role;
  roles: Role[];
  organizationId?: string | null;
  familyId: string;
  refreshHash: string;
  refreshJti: string;
  refreshExpiresAt: number;
  revokedAt?: string;
  replacedByJti?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateSessionInput {
  sessionId: string;
  familyId: string;
  actorId: string;
  actorType: ActorType;
  role: Role;
  roles: Role[];
  organizationId?: string | null;
  refreshToken: string;
  refreshJti: string;
  ipAddress?: string;
  userAgent?: string;
}

class AuthSessionStore {
  private readonly sessions = new Map<string, AuthSessionRecord>();

  create(input: CreateSessionInput): AuthSessionRecord {
    const now = new Date().toISOString();
    const record: AuthSessionRecord = {
      id: input.sessionId,
      actorId: input.actorId,
      actorType: input.actorType,
      role: input.role,
      roles: input.roles,
      organizationId: input.organizationId,
      familyId: input.familyId,
      refreshHash: hashSecret(input.refreshToken),
      refreshJti: input.refreshJti,
      refreshExpiresAt:
        Date.now() + jwtSecurityConfig().refreshTtlSeconds * 1000,
      createdAt: now,
      updatedAt: now,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };
    this.sessions.set(record.id, record);
    return record;
  }

  get(id: string | undefined): AuthSessionRecord | undefined {
    if (!id) {
      return undefined;
    }

    return this.sessions.get(id);
  }

  isActive(id: string | undefined): boolean {
    const session = this.get(id);
    return Boolean(
      session && !session.revokedAt && session.refreshExpiresAt > Date.now(),
    );
  }

  listForActor(actorId: string): AuthSessionRecord[] {
    return [...this.sessions.values()]
      .filter((session) => session.actorId === actorId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  rotate(
    sessionId: string,
    refreshToken: string,
    refreshJti: string,
    nextRefreshToken: string,
    nextRefreshJti: string,
  ): AuthSessionRecord {
    const session = this.sessions.get(sessionId);
    if (
      !session ||
      session.revokedAt ||
      session.refreshExpiresAt <= Date.now()
    ) {
      throw new Error('AUTH_SESSION_REVOKED');
    }

    if (
      session.refreshJti !== refreshJti ||
      session.refreshHash !== hashSecret(refreshToken)
    ) {
      this.revokeFamily(session.familyId);
      throw new Error('AUTH_REFRESH_REUSED');
    }

    const now = new Date().toISOString();
    session.refreshHash = hashSecret(nextRefreshToken);
    session.replacedByJti = nextRefreshJti;
    session.refreshJti = nextRefreshJti;
    session.refreshExpiresAt =
      Date.now() + jwtSecurityConfig().refreshTtlSeconds * 1000;
    session.lastUsedAt = now;
    session.updatedAt = now;
    return session;
  }

  revokeSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }

    session.revokedAt = new Date().toISOString();
    session.updatedAt = session.revokedAt;
    return true;
  }

  revokeActor(actorId: string): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.actorId === actorId && !session.revokedAt) {
        session.revokedAt = new Date().toISOString();
        session.updatedAt = session.revokedAt;
        count += 1;
      }
    }
    return count;
  }

  revokeFamily(familyId: string): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.familyId === familyId && !session.revokedAt) {
        session.revokedAt = new Date().toISOString();
        session.updatedAt = session.revokedAt;
        count += 1;
      }
    }
    return count;
  }
}

export const authSessionStore = new AuthSessionStore();
