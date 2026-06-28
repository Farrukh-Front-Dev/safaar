/**
 * Multi-til konfiguratsiyasi.
 * Tillar: O'zbek (asosiy), Rus, Ingliz. URL path orqali: `/uz`, `/ru`, `/en`.
 */
export const locales = ["uz", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

/** Til tanlash menyusi uchun ko'rsatiladigan nomlar. */
export const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
