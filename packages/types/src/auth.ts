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

/** JWT token ichidagi payload. */
export interface JwtPayload {
  sub: string;
  phone: string;
  role: Role;
}

/** Login natijasida qaytadigan tokenlar. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
