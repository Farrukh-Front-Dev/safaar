import type { AuthTokens } from "@agoda/types";
import { Role } from "@agoda/types";
import type { AuthUser } from "../../_stores/auth-store";

/**
 * Stub JWT decoder.
 *
 * Backend hozir `stub-access-token` qaytaradi, JWT middleware'i hali yo'q.
 * Shu sabab biz tokenni "decode" qilolmaymiz — frontendda PARTNER roli bilan
 * synthetic foydalanuvchi yaratamiz. Real JWT kelganda bu funksiyani
 * `jose.decodeJwt(token)` bilan almashtiramiz.
 */
export function buildPartnerSession(
  phone: string,
  tokens: AuthTokens,
): { user: AuthUser; tokens: AuthTokens } {
  return {
    user: {
      id: `staff-${phone}`,
      phone,
      fullName: "Resepsiyon Xodimi",
      role: Role.PARTNER,
    },
    tokens,
  };
}
