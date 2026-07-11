/**
 * Placeholder rasm yordamchisi.
 *
 * Backend hali real mehmonxona rasmlarini qaytarmaydi. Sayt "tirik" ko'rinishi
 * uchun DEV rejimida deterministik (seed bo'yicha barqaror) foto ishlatamiz.
 * PRODUCTION'da bu o'chiriladi — real rasm bo'lmasa, toza gradient placeholder
 * ko'rsatiladi (tasodifiy stock foto chiqib qolmasligi uchun).
 */

/** Dev'da placeholder fotolarini ko'rsatamizmi? */
export const SHOW_PLACEHOLDER_PHOTOS = process.env.NODE_ENV !== "production";

/** Seed bo'yicha barqaror placeholder rasm URL (picsum). */
export function placeholderPhoto(
  seed: string,
  width = 600,
  height = 450,
): string {
  const safe = encodeURIComponent(seed || "safaar");
  return `https://picsum.photos/seed/safaar-${safe}/${width}/${height}`;
}

/**
 * Berilgan real rasm yo'lini qaytaradi:
 * - http(s) → tashqi URL, o'zidek ishlatiladi
 * - /... → lokal public papka, o'zidek ishlatiladi
 * - undefined/bo'sh → dev placeholder, prod'da null (gradient)
 */
export function resolveImage(
  realUrl: string | undefined,
  seed: string,
  width?: number,
  height?: number,
): string | null {
  if (realUrl?.startsWith("http") || realUrl?.startsWith("/")) return realUrl;
  if (SHOW_PLACEHOLDER_PHOTOS) return placeholderPhoto(seed, width, height);
  return null;
}
