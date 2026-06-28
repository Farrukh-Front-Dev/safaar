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
}

export interface HotelListResult {
  items: HotelListItem[];
  total: number;
  page: number;
  limit: number;
}

interface RawListResponse {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
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
    },
    // Katalog tez-tez o'zgarmaydi — 60s ISR (Core Web Vitals uchun).
    next: { revalidate: 60 },
  });

  const data = camelizeKeys<RawListResponse>(raw);

  return {
    items: (data.items ?? []).map((item) => toHotelListItem(item as never, locale)),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 0,
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
