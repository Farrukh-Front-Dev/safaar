import type { Role } from "./auth";

export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: Role;
  isBlocked: boolean;
  createdAt: string;
}

/** Ro'yxatdan o'tish so'rovi (telefon + SMS OTP). */
export interface RegisterUserDto {
  phone: string;
  fullName: string;
  email?: string;
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
  challenge_id?: string;
}
