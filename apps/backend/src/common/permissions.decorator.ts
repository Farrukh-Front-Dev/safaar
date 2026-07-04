import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export function Permissions(...permissions: string[]) {
  return SetMetadata(PERMISSIONS_KEY, permissions);
}
