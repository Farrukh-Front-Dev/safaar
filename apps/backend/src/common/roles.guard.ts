import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@agoda/types';
import { ROLES_KEY } from './roles.decorator';
import {
  buildActorFromHeaders,
  type RequestActor,
  type RequestWithActor,
} from './actor';

/**
 * Rol asosidagi himoya (RBAC).
 *
 * Vaqtinchalik dev auth: JWT ulanishigacha actor `x-user-role`,
 * `x-user-id` va `x-organization-id` headerlari orqali olinadi.
 * Keyingi bosqichda JWT guard shu request.user obyektini to'ldiradi.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rol talab qilinmagan endpoint — ochiq.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithActor>();
    const user = request.user ?? buildActorFromHeaders(request.headers);

    if (user) {
      request.user = user;
    }

    if (!user || !hasRole(user, requiredRoles)) {
      throw new ForbiddenException('Bu amal uchun ruxsatingiz yoq.');
    }

    return true;
  }
}

function hasRole(actor: RequestActor, requiredRoles: Role[]): boolean {
  if (actor.role === Role.SUPER_ADMIN) {
    return true;
  }

  if (requiredRoles.includes(actor.role)) {
    return true;
  }

  if (actor.role === Role.ADMIN && requiredRoles.includes(Role.ADMIN)) {
    return true;
  }

  return actor.roles.some((role) => requiredRoles.includes(role));
}
