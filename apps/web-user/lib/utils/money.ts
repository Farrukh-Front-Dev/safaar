/**
 * Pul bilan ishlash — UZS (so'm).
 *
 * ⚠️ MUHIM: Backend pul summalarini **tiyin**da (minor unit) saqlaydi.
 * 1 so'm = 100 tiyin. Masalan backend `base_price: 45000000` → 450 000 so'm.
 * Shuning uchun ko'rsatishdan oldin doim `tiyinToSum` orqali o'tkazamiz.
 */

export const TIYIN_PER_SUM = 100;

/** Tiyin (butun) → so'm (butun/kasrli). */
export function tiyinToSum(tiyin: number): number {
  return Math.round(tiyin) / TIYIN_PER_SUM;
}

/** So'm qiymatini O'zbek formatida matn qilib qaytaradi: `450 000 so'm`. */
export function formatSum(sum: number): string {
  const formatted = Math.round(sum)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${formatted} so'm`;
}

/** Tiyinni to'g'ridan-to'g'ri so'm matniga: `450 000 so'm`. */
export function formatTiyin(tiyin: number): string {
  return formatSum(tiyinToSum(tiyin));
}
