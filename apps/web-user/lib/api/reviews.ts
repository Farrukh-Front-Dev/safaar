/**
 * Sharh (review) endpointlari (ochiq, GET). Backend `hotels.controller.ts`
 * (`GET /hotels/:id/reviews`) va `buses.controller.ts`
 * (`GET /bus-companies/:id/reviews`).
 *
 * Faqat "published" sharhlarni ko'rsatamiz (backend `hidden` qilganlarini
 * ham qaytarishi mumkin — frontda filtrlaymiz).
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import { toReviewView } from "@/lib/adapters/review";
import type { ReviewView } from "@/types/view";

interface RawReviewItem {
  status?: string;
}

function mapReviews(raw: unknown): ReviewView[] {
  const items = camelizeKeys<(RawReviewItem & Record<string, unknown>)[]>(raw);
  return (items ?? [])
    .filter((item) => (item.status ?? "published") !== "hidden")
    .map((item) => toReviewView(item as never));
}

/** `GET /hotels/:id/reviews` — mehmonxona sharhlari. */
export async function getHotelReviews(hotelId: string): Promise<ReviewView[]> {
  const raw = await api.get<unknown>(
    `/hotels/${encodeURIComponent(hotelId)}/reviews`,
    { next: { revalidate: 60 } },
  );
  return mapReviews(raw);
}

/** `GET /bus-companies/:id/reviews` — avtobus kompaniyasi sharhlari. */
export async function getBusCompanyReviews(
  companyId: string,
): Promise<ReviewView[]> {
  if (!companyId) return [];
  const raw = await api.get<unknown>(
    `/bus-companies/${encodeURIComponent(companyId)}/reviews`,
    { next: { revalidate: 60 } },
  );
  return mapReviews(raw);
}
