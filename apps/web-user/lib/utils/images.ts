import { config } from "../config";

/** Dev'da placeholder fotolarini ko'rsatamizmi? */
export const SHOW_PLACEHOLDER_PHOTOS = config.showPlaceholderPhotos;

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
