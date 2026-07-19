import { SetMetadata } from '@nestjs/common';
import { Role } from '@Safaar/types';

export const ROLES_KEY = 'roles';

/**
 * Endpoint'ni ma'lum rollar bilan himoyalash.
 * Masalan: @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
