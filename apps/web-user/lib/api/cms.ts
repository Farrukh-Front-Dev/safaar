/**
 * CMS / ommaviy ma'lumotlar (ochiq GET): chegirmali takliflar, statistika.
 * Endpointlar: backend `cms.controller.ts`, `stats.controller.ts`.
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import { tiyinToSum } from "@/lib/money";
import type { Locale } from "@/i18n/config";

export interface PublicStatsView {
  totalHotels: number;
  totalCities: number;
  averageRating: number;
  totalBookings: number;
  totalPartners: number;
}

type Localized = Partial<Record<Locale, string>> & Record<string, string>;

function pickLocale(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] ?? value.uz ?? Object.values(value)[0] ?? "";
}

export interface DealView {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  imageUrl: string;
  oldPriceSum: number;
  newPriceSum: number;
  discountPercent: number;
  endsAt: string;
  status: string;
}

interface RawDeal {
  id: string;
  slug: string;
  name: Localized;
  cityName?: Localized;
  imageUrl?: string;
  oldPrice?: number;
  newPrice?: number;
  discountPercent?: number;
  endsAt?: string;
  status?: string;
}

function toDealView(raw: RawDeal, locale: Locale): DealView {
  return {
    id: raw.id,
    slug: raw.slug,
    name: pickLocale(raw.name, locale),
    cityName: pickLocale(raw.cityName, locale),
    imageUrl: raw.imageUrl ?? "",
    oldPriceSum: tiyinToSum(raw.oldPrice ?? 0),
    newPriceSum: tiyinToSum(raw.newPrice ?? 0),
    discountPercent: raw.discountPercent ?? 0,
    endsAt: raw.endsAt ?? "",
    status: raw.status ?? "active",
  };
}

/** `GET /cms/offers` — bosh sahifa "Chegirmadagi takliflar" uchun. */
export async function getDeals(locale: Locale): Promise<DealView[]> {
  const raw = await api.get<unknown>("/cms/offers", {
    next: { revalidate: 300 },
  });
  const items = camelizeKeys<RawDeal[]>(raw);
  return (items ?? [])
    .filter((item) => (item.status ?? "active") === "active")
    .map((item) => toDealView(item, locale));
}

/** `GET /stats/public` — bosh sahifa "TrustBar" statistikasi uchun. */
export async function getPublicStats(): Promise<PublicStatsView | null> {
  const raw = await api
    .get<unknown>("/stats/public", { next: { revalidate: 3600 } })
    .catch(() => null);
  if (!raw) return null;
  const data = camelizeKeys<PublicStatsView>(raw);
  return {
    totalHotels: data.totalHotels ?? 0,
    totalCities: data.totalCities ?? 0,
    averageRating: Number(data.averageRating) || 0,
    totalBookings: data.totalBookings ?? 0,
    totalPartners: data.totalPartners ?? 0,
  };
}
