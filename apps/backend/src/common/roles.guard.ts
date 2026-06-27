import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@agoda/types';
import { ROLES_KEY } from './roles.decorator';

/**
 * Rol asosidagi himoya (RBAC).
 *
 * Hozircha skeleton: foydalanuvchi `request.user` ichida bo'ladi deb taxmin
 * qilinadi (keyinchalik JWT auth guard tomonidan to'ldiriladi).
 * JWT integratsiyasi (@nestjs/jwt) qo'shilgach, bu guard auth guard'dan
 * keyin ishlatiladi.
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

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: Role } }>();
    const user = request.user;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bu amal uchun ruxsatingiz yoq.');
    }

    return true;
  }
}
