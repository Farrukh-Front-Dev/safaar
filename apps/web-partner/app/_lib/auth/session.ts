import type { AuthTokens } from "@safaar/types";
import { Role } from "@safaar/types";
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
  partnerType?: string,
): { user: AuthUser; tokens: AuthTokens } {
  let resolvedType = partnerType || "hotel";
  if (phone.includes("7777777")) {
    resolvedType = "dacha";
  } else if (phone.includes("8888888")) {
    resolvedType = "hostel";
  } else if (phone.includes("9999999")) {
    resolvedType = "bus";
  }

  return {
    user: {
      id: `staff-${phone}`,
      phone,
      fullName: "Resepsiyon Xodimi",
      role: Role.PARTNER,
      partnerType: resolvedType,
    },
    tokens,
  };
}
