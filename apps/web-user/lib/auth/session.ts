/**
 * Foydalanuvchi sessiyasi — httpOnly cookie'da saqlanadi.
 *
 * Nega cookie? Server Component'lar himoyalangan ma'lumotni (bron, profil)
 * serverda oladi — token/sessiyani o'qiy olishi kerak. localStorage faqat
 * brauzerda, shuning uchun cookie eng to'g'ri yo'l.
 *
 * ⚠️ Dev auth: backend `RolesGuard` hozircha `x-user-role` / `x-user-id`
 * headerlarini o'qiydi (JWT keyin ulanadi). Shuning uchun himoyalangan
 * so'rovlarda `devAuthHeaders` yuboriladi. Backend JWT qo'shganda — bu yerni
 * `Authorization: Bearer` ga o'zgartiramiz, qolgan kod tegmaydi.
 */
import "server-only";
import { cookies } from "next/headers";
import { Role } from "@agoda/types";

const COOKIE_NAME = "safaar_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 kun

export interface Session {
  userId: string;
  role: Role;
  email?: string;
  accessToken: string;
  refreshToken: string;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Backend dev auth headerlari (himoyalangan endpointlar uchun). */
export function devAuthHeaders(session: Session): Record<string, string> {
  return { "x-user-role": session.role, "x-user-id": session.userId };
}
