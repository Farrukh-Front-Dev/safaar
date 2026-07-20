import type { AuthTokens, VerifyOtpDto } from "@safaar/types";
import { request } from "../client";

export interface OtpRequestResponse {
  sent: boolean;
}

/** SMS OTP yuborish so'rovi. */
export function requestOtp(phone: string): Promise<OtpRequestResponse> {
  return request<OtpRequestResponse>("/auth/otp/request", {
    method: "POST",
    body: { phone },
  });
}

/** OTP'ni tekshirib, JWT tokenlarini olish. */
export function verifyOtp(dto: VerifyOtpDto): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/otp/verify", {
    method: "POST",
    body: dto,
  });
}
