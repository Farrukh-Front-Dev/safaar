import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@agoda/types';

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
  [Role.SUPER_ADMIN]: 'admin',
};

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function buildActorFromHeaders(
  headers: RequestWithActor['headers'],
): RequestActor | undefined {
  const rawRole = firstHeader(headers['x-user-role']);

  if (!rawRole || !(rawRole in Role)) {
    return undefined;
  }

  const role = Role[rawRole as keyof typeof Role];
  const actorType = roleActorType[role] ?? 'user';
  const id =
    firstHeader(headers['x-user-id']) ??
    (actorType === 'admin'
      ? 'demo-admin-id'
      : actorType === 'partner'
        ? 'demo-partner-user-id'
        : 'demo-user-id');

  return {
    id,
    actorType,
    role,
    roles: [role],
    organizationId:
      firstHeader(headers['x-organization-id']) ?? 'demo-partner-org-id',
    sessionId: firstHeader(headers['x-session-id']) ?? 'demo-session-id',
  };
}

export const CurrentActor = createParamDecorator(
  (_: unknown, context: ExecutionContext): RequestActor | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithActor>();
    return request.user ?? buildActorFromHeaders(request.headers);
  },
);
