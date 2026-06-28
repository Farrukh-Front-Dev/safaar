"use server";

import { redirect } from "next/navigation";
import { Role } from "@agoda/types";
import { ApiRequestError } from "@/lib/api";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { clearSession, setSession } from "@/lib/auth/session";
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
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  // Faqat ichki (nisbiy) yo'lga yo'naltiramiz (open redirect xavfsizligi).
  const target = next.startsWith("/") ? next : `/${locale}`;
  redirect(target);
}

export async function logoutAction(rawLocale: string): Promise<void> {
  await clearSession();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  redirect(`/${locale}`);
}
