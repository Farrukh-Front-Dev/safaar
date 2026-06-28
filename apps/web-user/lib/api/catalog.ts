/**
 * Katalog endpointlari (ochiq ma'lumotnoma: shaharlar, qulayliklar...).
 * Endpointlar: backend `catalog.controller.ts`.
 *
 * Bu ma'lumotlar deyarli o'zgarmaydi — uzoq ISR (1 soat) bilan keshlaymiz.
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import type { Locale } from "@/i18n/config";
import type { AmenityOption, CityOption } from "@/types/view";

type Localized = Partial<Record<Locale, string>> & Record<string, string>;

interface RawCatalogItem {
  id: string;
  name: Localized;
}

function pickLocale(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] ?? value.uz ?? Object.values(value)[0] ?? "";
}

async function fetchCatalog(
  path: string,
  locale: Locale,
): Promise<Array<{ id: string; name: string }>> {
  const raw = await api.get<unknown>(path, { next: { revalidate: 3600 } });
  const items = camelizeKeys<RawCatalogItem[]>(raw);
  return (items ?? []).map((item) => ({
    id: item.id,
    name: pickLocale(item.name, locale),
  }));
}

/** `GET /catalog/cities` — qidiruv uchun shaharlar ro'yxati. */
export async function getCities(locale: Locale): Promise<CityOption[]> {
  return fetchCatalog("/catalog/cities", locale);
}

/** `GET /catalog/amenities` — qulaylik id → nom (tilga moslangan). */
export async function getAmenities(locale: Locale): Promise<AmenityOption[]> {
  return fetchCatalog("/catalog/amenities", locale);
}
