"use server";

import { redirect } from "next/navigation";
import { Role } from "@agoda/types";
import { ApiRequestError } from "@/lib/api";
import { completeProfile, sendOtp, verifyOtp } from "@/lib/api/auth";
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
    const result = await sendOtp(phone);
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

  try {
    const result = await verifyOtp(phone, code);
    await setSession({
      userId: result.user.id,
      role: Role.USER,
      phone: result.user.phone,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    // Yangi foydalanuvchi (firstName yo'q) — profil to'ldirish sahifasiga
    if (!result.user.firstName) {
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

  if (!firstName) {
    return { error: "FIRST_NAME_REQUIRED" };
  }

  try {
    const session = await getSession();
    if (!session) return { error: "SESSION_EXPIRED" };

    await completeProfile(session.accessToken, { firstName, lastName, email: email || undefined });
    // Session'dagi phone ni yangilab, firstName ham saqlash
    await setSession({ ...session });
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  redirect(`/${locale}`);
}

export async function logoutAction(rawLocale: string): Promise<void> {
  await clearSession();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  redirect(`/${locale}`);
}
