import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role, type ActorType } from '@agoda/types';
import { demoAuthEnabled, verifyJwt } from '../auth/security';

export interface RequestActor {
  id: string;
  actorType: 'user' | 'partner' | 'admin';
  role: Role;
  roles: Role[];
  organizationId?: string;
  sessionId?: string;
}

export interface RequestWithActor {
  user?: RequestActor;
  headers: Record<string, string | string[] | undefined>;
}

const roleActorType: Partial<Record<Role, RequestActor['actorType']>> = {
  [Role.USER]: 'user',
  [Role.PARTNER]: 'partner',
  [Role.ADMIN]: 'admin',
  [Role.FINANCE_ADMIN]: 'admin',
  [Role.CONTENT_ADMIN]: 'admin',
  [Role.SUPPORT_ADMIN]: 'admin',
  [Role.MODERATOR]: 'admin',
  [Role.SUPER_ADMIN]: 'admin',
};

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function buildActorFromHeaders(
  headers: RequestWithActor['headers'],
  options: { allowDemoAuth?: boolean } = {},
): RequestActor | undefined {
  const jwtActor = buildActorFromAuthorization(headers);
  if (jwtActor) {
    return jwtActor;
  }

  const allowDemoAuth = options.allowDemoAuth ?? false;
  if (!allowDemoAuth) {
    return undefined;
  }

  const rawRole = firstHeader(headers['x-user-role']);

  if (rawRole && rawRole in Role) {
    const role = Role[rawRole as keyof typeof Role];
    const actorType = roleActorType[role] ?? 'user';
    const id =
      firstHeader(headers['x-user-id']) ??
      (actorType === 'admin'
        ? 'demo-admin-id'
        : actorType === 'partner'
          ? 'demo-partner-user-id'
          : 'demo-user-id');

    return buildActor(role, id, headers);
  }

  return buildDemoActorFromAuthorization(headers);
}

function buildActorFromAuthorization(
  headers: RequestWithActor['headers'],
): RequestActor | undefined {
  const authorization = firstHeader(headers.authorization);
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;

  if (!token) {
    return undefined;
  }

  const payload = verifyJwt(token, 'access');
  if (!payload) {
    return undefined;
  }

  return {
    id: payload.sub,
    actorType: payload.actor_type,
    role: payload.role,
    roles: payload.roles?.length ? payload.roles : [payload.role],
    organizationId: payload.organization_id ?? undefined,
    sessionId: payload.session_id,
  };
}

function buildDemoActorFromAuthorization(
  headers: RequestWithActor['headers'],
): RequestActor | undefined {
  const authorization = firstHeader(headers.authorization);
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;

  if (!token || !demoAuthEnabled()) {
    return undefined;
  }

  if (!token.startsWith('mock-access.')) {
    return undefined;
  }

  const [, actorId, roleValue] = token.split('.');
  if (!actorId || !Object.values(Role).includes(roleValue as Role)) {
    return undefined;
  }

  return buildActor(roleValue as Role, actorId, headers);
}

function buildActor(
  role: Role,
  id: string,
  headers: RequestWithActor['headers'],
): RequestActor {
  const actorType: ActorType = roleActorType[role] ?? 'user';

  return {
    id,
    actorType,
    role,
    roles: [role],
    organizationId: firstHeader(headers['x-organization-id']),
    sessionId: firstHeader(headers['x-session-id']),
  };
}

export const CurrentActor = createParamDecorator(
  (_: unknown, context: ExecutionContext): RequestActor | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithActor>();
    return request.user;
  },
);
