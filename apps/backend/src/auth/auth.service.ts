import { Injectable } from '@nestjs/common';
import type { VerifyOtpDto, AuthTokens } from '@agoda/types';

/**
 * Autentifikatsiya xizmati.
 * Skeleton: SMS OTP (Eskiz.uz / PlayMobile) va JWT integratsiyasi
 * keyingi bosqichda qo'shiladi.
 */
@Injectable()
export class AuthService {
  /** Telefon raqamga OTP kod yuborish. */
  requestOtp(phone: string): { sent: boolean } {
    // TODO: SMS provayder (Eskiz.uz) integratsiyasi.
    void phone;
    return { sent: true };
  }

  /** OTP kodni tekshirish va token qaytarish. */
  verifyOtp(dto: VerifyOtpDto): AuthTokens {
    // TODO: kodni tekshirish + JWT generatsiya (@nestjs/jwt).
    void dto;
    return {
      accessToken: 'stub-access-token',
      refreshToken: 'stub-refresh-token',
    };
  }
}
