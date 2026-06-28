/**
 * Platformadagi foydalanuvchi rollari (RBAC).
 * Bitta backend API uchala panelga ham xizmat qiladi,
 * ruxsatlar shu rollar asosida ajratiladi.
 */
export enum Role {
  /** Mijoz — uzbron.uz */
  USER = "USER",
  /** Hamkor (mehmonxona / avtobus kompaniyasi) — partner.uzbron.uz */
  PARTNER = "PARTNER",
  /** Platforma administratori — admin.uzbron.uz */
  ADMIN = "ADMIN",
  /** Super administrator — to'liq nazorat */
  SUPER_ADMIN = "SUPER_ADMIN",
}

export type ActorType = "user" | "partner" | "admin";

/** JWT token ichidagi payload. */
export interface JwtPayload {
  sub: string;
  phone?: string;
  role?: Role;
  actor_type?: ActorType;
  organization_id?: string | null;
  roles?: Role[];
  session_id?: string;
  iat?: number;
  exp?: number;
}

/** Login natijasida qaytadigan tokenlar. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
