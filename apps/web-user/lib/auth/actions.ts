"use server";

import { redirect } from "next/navigation";
import { Role } from "@agoda/types";
import { api, ApiRequestError } from "@/lib/api";
import { clearSession, getSession, setSession } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/i18n/config";

/** OTP yuborish natijasi (LoginForm `useActionState`da ishlatadi). */
export interface OtpState {
  ok: boolean;
  devCode?: string;
  error?: string;
}

export async function requestOtpAction(
  _prev: OtpState,
  formData: FormData,
): Promise<OtpState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return { ok: false, error: "PHONE_REQUIRED" };

  try {
    const result = await api.auth.sendOtp(phone);
    return { ok: true, devCode: result.devCode };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }
}

export interface VerifyState {
  error?: string;
  /** Yangi foydalanuvchi bo'lsa — profil to'ldirish uchun redirect kerak. */
  needsProfile?: boolean;
  locale?: string;
}

export async function verifyOtpAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const phone = String(formData.get("phone") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const rawLocale = String(formData.get("locale") ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const next = String(formData.get("next") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const result = await api.auth.verifyOtp(phone, code);
    await setSession({
      userId: result.user.id,
      role: Role.USER,
      email: result.user.email,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    // Yangi foydalanuvchi (firstName yo'q) — profil to'ldirish sahifasiga
    if (!result.user.firstName) {
      // Agar shu formda profil ma'lumotlari kelgan bo'lsa — darhol completeProfile
      if (firstName) {
        const session = await getSession();
        if (!session) return { error: "SESSION_EXPIRED" };

        const passwordError = validatePassword(password);
        if (passwordError) return { error: passwordError };

        await api.auth.completeProfile(session.accessToken, {
          firstName,
          lastName: lastName || undefined,
          email: email || undefined,
          password: password || undefined,
        });
        await setSession({ ...session });

        const target = next.startsWith("/") ? next : `/${locale}`;
        redirect(target);
      }

      return { needsProfile: true, locale };
    }
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  const target = next.startsWith("/") ? next : `/${locale}`;
  redirect(target);
}

export interface CompleteProfileState {
  error?: string;
  ok?: boolean;
}

export async function completeProfileAction(
  _prev: CompleteProfileState,
  formData: FormData,
): Promise<CompleteProfileState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const rawLocale = String(formData.get("locale") ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const password = String(formData.get("password") ?? "");

  if (!firstName) {
    return { error: "FIRST_NAME_REQUIRED" };
  }
  if (!email) {
    return { error: "EMAIL_REQUIRED" };
  }

  const passwordError = validatePassword(password);
  if (password && passwordError) {
    return { error: passwordError };
  }

  try {
    const session = await getSession();
    if (!session) return { error: "SESSION_EXPIRED" };

    await api.auth.completeProfile(session.accessToken, {
      firstName,
      lastName: lastName || undefined,
      email,
      password: password || undefined,
    });
    await setSession({ ...session });
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  redirect(`/${locale}`);
}

function validatePassword(password: string): string | null {
  if (!password) return null; // ixtiyoriy
  if (password.length < 8) return "PASSWORD_TOO_SHORT";
  if (!/[A-Z]/.test(password)) return "PASSWORD_NO_UPPERCASE";
  if (!/[a-z]/.test(password)) return "PASSWORD_NO_LOWERCASE";
  if (!/[0-9]/.test(password)) return "PASSWORD_NO_NUMBER";
  if (!/[^A-Za-z0-9]/.test(password)) return "PASSWORD_NO_SPECIAL";
  return null;
}

export async function logoutAction(rawLocale: string): Promise<void> {
  await clearSession();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  redirect(`/${locale}`);
}
