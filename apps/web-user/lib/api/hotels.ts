/**
 * Mehmonxona endpointlari (USER, ochiq) — markaziy `api` client + adapter ustida.
 *
 * Sahifalar shu funksiyalarni chaqiradi, to'g'ridan-to'g'ri `fetch` qilmaydi.
 * Endpointlar: backend `hotels.controller.ts`.
 *
 * ⚠️ Nega bu yerda adapter bor? Backend mehmonxonani `snake_case`, ko'p tilli
 * (`name: { uz, ru, en }`) va narxni **tiyin**da qaytaradi — bu `@agoda/types`
 * dagi soddalashtirilgan `Hotel`ga to'g'ri kelmaydi. Shuning uchun javobni
 * `camelizeKeys` + adapter orqali UI uchun tayyor view-model'ga aylantiramiz.
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import { toHotelDetail, toHotelListItem } from "@/lib/adapters/hotel";
import type { Locale } from "@/i18n/config";
import type { HotelDetail, HotelListItem } from "@/types/view";

export interface HotelListParams {
  cityId?: string;
  stars?: number;
  page?: number;
  limit?: number;
  featured?: boolean;
  sort?: "price_asc" | "price_desc" | "rating";
  minPrice?: number;
  maxPrice?: number;
}

export interface HotelListResult {
  items: HotelListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RawListResponse {
  items?: unknown[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/** `GET /hotels` — e'lon qilingan mehmonxonalar ro'yxati. */
export async function getHotels(
  locale: Locale,
  params: HotelListParams = {},
): Promise<HotelListResult> {
  const raw = await api.get<unknown>("/hotels", {
    query: {
      city_id: params.cityId,
      stars: params.stars,
      page: params.page,
      limit: params.limit,
      featured: params.featured ? "true" : undefined,
      sort: params.sort,
      min_price: params.minPrice,
      max_price: params.maxPrice,
    },
    // Katalog tez-tez o'zgarmaydi — 60s ISR (Core Web Vitals uchun).
    next: { revalidate: 60 },
  });

  // Backend filtered ro'yxat qaytaradi (array yoki {items, total, ...}).
  const data = camelizeKeys<RawListResponse | unknown[]>(raw);
  const items = Array.isArray(data)
    ? data
    : (data.items ?? []);
  const mapped = (items ?? []).map((item) =>
    toHotelListItem(item as never, locale),
  );

  return {
    items: mapped,
    total: Array.isArray(data)
      ? mapped.length
      : (data.total ?? mapped.length),
    page: Array.isArray(data) ? 1 : (data.page ?? 1),
    limit: Array.isArray(data) ? mapped.length : (data.limit ?? mapped.length),
    totalPages: Array.isArray(data)
      ? 1
      : (data.totalPages ?? Math.ceil((data.total ?? mapped.length) / (data.limit || mapped.length || 1))),
  };
}

/** `GET /hotels/:slugOrId` — bitta mehmonxona (xonalari bilan). */
export async function getHotel(
  locale: Locale,
  slugOrId: string,
): Promise<HotelDetail> {
  const raw = await api.get<unknown>(`/hotels/${encodeURIComponent(slugOrId)}`);
  return toHotelDetail(camelizeKeys(raw) as never, locale);
}

/** `GET /hotels/featured` — bosh sahifa uchun tanlangan mehmonxonalar. */
export async function getFeaturedHotels(
  locale: Locale,
  params: HotelListParams = {},
): Promise<HotelListResult> {
  return getHotels(locale, { ...params, featured: true });
}
