import { rawApi } from "../client";
import { camelizeKeys } from "../case";
import type { Locale, CityOption, AmenityOption } from "../types";

export interface PopularCityView {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  hotelCount: number;
  sortOrder: number;
}

export interface PartnerShowcaseView {
  id: string;
  companyName: string;
  logoUrl: string;
  type: string;
  sortOrder: number;
}

type Localized = Partial<Record<Locale, string>> & Record<string, string>;

interface RawCatalogItem {
  id: string;
  name: Localized;
}

interface RawPopularCity {
  id: string;
  name: Localized;
  slug?: string;
  imageUrl?: string;
  hotelCount?: number;
  sortOrder?: number;
}

interface RawPartnerShowcase {
  id: string;
  companyName?: string;
  logoUrl?: string;
  type?: string;
  sortOrder?: number;
}

function pickLocale(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] ?? value.uz ?? Object.values(value)[0] ?? "";
}

async function fetchCatalog(
  path: string,
  locale: Locale,
): Promise<Array<{ id: string; name: string }>> {
  const raw = await rawApi.get<unknown>(path, { next: { revalidate: 3600 } } as any);
  const items = camelizeKeys<RawCatalogItem[]>(raw);
  return (items ?? []).map((item) => ({
    id: item.id,
    name: pickLocale(item.name, locale),
  }));
}

export const catalogService = {
  /** `GET /catalog/cities` — qidiruv uchun shaharlar ro'yxati. */
  async getCities(locale: Locale): Promise<CityOption[]> {
    return fetchCatalog("/catalog/cities", locale);
  },

  /** `GET /catalog/amenities` — qulaylik id → nom (tilga moslangan). */
  async getAmenities(locale: Locale): Promise<AmenityOption[]> {
    return fetchCatalog("/catalog/amenities", locale);
  },

  /** `GET /catalog/popular-cities` — bosh sahifa uchun mashhur shaharlar. */
  async getPopularCities(locale: Locale): Promise<PopularCityView[]> {
    const raw = await rawApi.get<unknown>("/catalog/popular-cities");
    const items = camelizeKeys<RawPopularCity[]>(raw);
    return (items ?? []).map((item) => ({
      id: item.id,
      name: pickLocale(item.name, locale),
      slug: item.slug ?? "",
      imageUrl: item.imageUrl ?? "",
      hotelCount: item.hotelCount ?? 0,
      sortOrder: item.sortOrder ?? 0,
    }));
  },

  /** `GET /catalog/partners-showcase` — bosh sahifa uchun hamkor logolari. */
  async getPartnersShowcase(): Promise<PartnerShowcaseView[]> {
    const raw = await rawApi.get<unknown>("/catalog/partners-showcase", {
      next: { revalidate: 3600 },
    } as any);
    const items = camelizeKeys<RawPartnerShowcase[]>(raw);
    return (items ?? []).map((item) => ({
      id: item.id,
      companyName: item.companyName ?? "",
      logoUrl: item.logoUrl ?? "",
      type: item.type ?? "",
      sortOrder: item.sortOrder ?? 0,
    }));
  },
};
