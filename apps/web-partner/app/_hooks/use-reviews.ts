"use client";

import { useDataStore } from "../_stores/data-store";

export function useReviews() {
  const data = useDataStore((s) => s.reviews);
  return { data, isLoading: false };
}
