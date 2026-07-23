import { config } from "./config";

export interface LocalizedString {
  uz?: string;
  ru?: string;
  en?: string;
  [key: string]: string | undefined;
}

export interface PromoBarConfig {
  id?: string;
  isActive: boolean;
  text?: LocalizedString | string;
  badge?: LocalizedString | string;
  link?: string;
  linkText?: LocalizedString | string;
  endsAt?: string | null;
  isDismissible?: boolean;
}

/**
 * Utility to resolve localized string value based on current locale.
 */
export function getLocalizedText(
  value: LocalizedString | string | undefined | null,
  locale: string
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value.uz ?? value.ru ?? value.en ?? Object.values(value)[0] ?? "";
}

/**
 * Fetch dynamic promo bar configuration from API.
 * Falls back safely if backend endpoint is not available yet.
 */
export async function getPromoBarConfig(locale: string): Promise<PromoBarConfig | null> {
  try {
    const res = await fetch(`${config.apiUrl}/cms/promo-bar`, {
      headers: {
        "Accept-Language": locale,
      },
      next: { revalidate: 60, tags: ["promo-bar"] },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Backend endpoint not created yet; return null to allow dictionary fallback
        return null;
      }
      return null;
    }

    const data = await res.json();
    if (!data) return null;

    return {
      id: data.id ?? "default",
      isActive: data.isActive ?? data.is_active ?? true,
      text: data.text,
      badge: data.badge,
      link: data.link,
      linkText: data.linkText ?? data.link_text,
      endsAt: data.endsAt ?? data.ends_at ?? null,
      isDismissible: data.isDismissible ?? data.is_dismissible ?? true,
    };
  } catch {
    // API network or fetch error, return null safely
    return null;
  }
}
