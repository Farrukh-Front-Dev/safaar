"use client";

import { useQuery } from "@tanstack/react-query";
import { pageItems, toListing } from "../_lib/api/adapters";
import { partners } from "../_lib/api";
import { useDataStore } from "../_stores/data-store";

/** E'lon (listing) — mehmonxona mijozga ko'rinadigan sahifasi. */
export function useListing() {
  const fallback = useDataStore((s) => s.listing);
  const query = useQuery({
    queryKey: ["partner", "listing"],
    queryFn: async () => {
      try {
        const [hotel] = pageItems(await partners.listHotels());
        return hotel ? toListing(hotel) : fallback;
      } catch {
        return fallback;
      }
    },
  });

  return { data: query.data ?? fallback, isLoading: query.isLoading && !query.data };
}

/** E'lon to'ldirilganligini tekshirish. */
export function useListingCompleteness() {
  // Selector reaktivligi uchun listing'ni ko'rsatamiz
  const listing = useDataStore((s) => s.listing);
  const check = useDataStore((s) => s.isListingComplete);
  void listing;
  return check();
}
