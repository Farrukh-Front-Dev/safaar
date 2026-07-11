/**
 * Auth endpointlari (telefon + SMS OTP). Backend `auth.controller.ts`.
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";

export interface SendOtpResult {
  sent: boolean;
  expiresInSeconds: number;
  /** Dev rejimida backend test kodini qaytaradi (prod'da bo'lmaydi). */
  devCode?: string;
}

export interface VerifyOtpResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
}

export interface CompleteProfileResult {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/** `POST /auth/user/send-otp` — telefonga OTP yuborish. */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  const raw = await api.post<unknown>("/auth/user/send-otp", { phone });
  return camelizeKeys<SendOtpResult>(raw);
}

/** `POST /auth/user/verify-otp` — kodni tekshirish, token + user qaytaradi. */
export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResult> {
  const raw = await api.post<unknown>("/auth/user/verify-otp", { phone, code });
  return camelizeKeys<VerifyOtpResult>(raw);
}

/** `POST /auth/user/complete-profile` — birinchi marta kirgan foydalanuvchi profilini to'ldiradi. */
export async function completeProfile(
  token: string,
  data: { firstName?: string; lastName?: string; email?: string; password?: string },
): Promise<CompleteProfileResult> {
  const body: Record<string, unknown> = {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
  };
  if (data.password) {
    body.password = data.password;
  }
  const raw = await api.post<unknown>(
    "/auth/user/complete-profile",
    body,
    { token },
  );
  return camelizeKeys<CompleteProfileResult>(raw);
}
