"use client";

import { useDataStore } from "../_stores/data-store";

/** E'lon (listing) — mehmonxona mijozga ko'rinadigan sahifasi. */
export function useListing() {
  const data = useDataStore((s) => s.listing);
  return { data, isLoading: false };
}

/** E'lon to'ldirilganligini tekshirish. */
export function useListingCompleteness() {
  // Selector reaktivligi uchun listing'ni ko'rsatamiz
  const listing = useDataStore((s) => s.listing);
  const check = useDataStore((s) => s.isListingComplete);
  void listing;
  return check();
}
