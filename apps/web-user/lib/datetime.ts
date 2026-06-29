/**
 * Sana/vaqtni UI uchun formatlash. Backend ISO (UTC) qaytaradi.
 *
 * Tilga mos lokal formatlash uchun `Intl` ishlatamiz. Toshkent vaqt mintaqasi
 * (`Asia/Tashkent`) — server va brauzerda bir xil natija bo'lishi uchun
 * timezone'ni aniq belgilaymiz (gidratsiya nomuvofiqligini oldini olish).
 */
import type { Locale } from "@/i18n/config";

const LOCALE_TAG: Record<Locale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

const TIME_ZONE = "Asia/Tashkent";

/** `2026-07-01T04:00:00Z` → `09:00` (Toshkent vaqti). */
export function formatTime(iso: string, locale: Locale): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** `2026-07-01T04:00:00Z` → `1-iyul, 09:00` ko'rinishidagi to'liq sana-vaqt. */
export function formatDateTime(iso: string, locale: Locale): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Davomiylik (daqiqa) → `4 soat 30 daqiqa` ko'rinishi. */
export function formatDuration(minutes: number, labels: {
  hour: string;
  minute: string;
}): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${labels.hour}`);
  if (mins > 0) parts.push(`${mins} ${labels.minute}`);
  return parts.join(" ");
}
