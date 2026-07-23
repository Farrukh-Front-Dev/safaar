/**
 * Backend sharh (review) javobini front view-model'ga aylantiruvchi adapter.
 *
 * Backend sharhlarni flat `snake_case` yozuv sifatida qaytaradi
 * (`{ id, user_id, rating, body, status, created_at, ... }`), `camelizeKeys`
 * orqali allaqachon `camelCase`ga o'tkazilgan. Faqat UI uchun kerakli
 * maydonlarni olamiz.
 */
import type { ReviewView } from "@/types/view";

interface RawReview {
  id?: string;
  rating?: number;
  body?: string;
  status?: string;
  createdAt?: string;
}

export function toReviewView(raw: RawReview): ReviewView {
  return {
    id: raw.id ?? "",
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    body: raw.body ?? "",
    createdAt: raw.createdAt ?? "",
  };
}
