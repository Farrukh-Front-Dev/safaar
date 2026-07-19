import { rawApi } from "../client";
import { camelizeKeys } from "../case";

export interface SendOtpResult {
  sent: boolean;
  expiresInSeconds: number;
  devCode?: string;
}

export interface VerifyOtpResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface CompleteProfileResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  /** `POST /auth/user/send-otp` — telefon raqamiga OTP yuborish. */
  async sendOtp(phone: string): Promise<SendOtpResult> {
    const raw = await rawApi.post<unknown>("/auth/user/send-otp", { phone });
    return camelizeKeys<SendOtpResult>(raw);
  },

  /** `POST /auth/user/verify-otp` — kodni tekshirish, token + user qaytaradi. */
  async verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
    const raw = await rawApi.post<unknown>("/auth/user/verify-otp", { phone, code });
    return camelizeKeys<VerifyOtpResult>(raw);
  },

  /** `POST /auth/user/complete-profile` — birinchi marta kirgan foydalanuvchi profilini to'ldiradi. */
  async completeProfile(
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
    const raw = await rawApi.post<unknown>(
      "/auth/user/complete-profile",
      body,
      { token },
    );
    return camelizeKeys<CompleteProfileResult>(raw);
  },
};
