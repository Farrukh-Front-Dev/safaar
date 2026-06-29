"use client";

import { useDataStore } from "../_stores/data-store";

/**
 * Bronlar ro'yxati — store'dan reaktiv.
 * Backend tayyor bo'lsa, `useQuery` bilan almashtiriladi.
 */
export function useReservations() {
  const data = useDataStore((s) => s.reservations);
  return { data, isLoading: false, refetch: () => {}, isFetching: false };
}

/** Bitta bron tafsiloti. */
export function useReservation(id: string) {
  const data = useDataStore((s) =>
    s.reservations.find((r) => r.id === id) ?? null,
  );
  return { data, isLoading: false };
}
