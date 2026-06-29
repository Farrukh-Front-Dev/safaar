"use client";

import { useDataStore } from "../_stores/data-store";

export function useGuests() {
  const data = useDataStore((s) => s.guests);
  return { data, isLoading: false };
}
