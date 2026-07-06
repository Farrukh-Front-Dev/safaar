"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { pageItems, toReservation } from "../_lib/api/adapters";
import { partners } from "../_lib/api";
import { useDataStore } from "../_stores/data-store";

/**
 * Bronlar ro'yxati — store'dan reaktiv.
 * Backend tayyor bo'lsa, `useQuery` bilan almashtiriladi.
 */
export function useReservations() {
  const data = useDataStore((s) => s.reservations);
  const setReservations = useDataStore((s) => s.setReservations);
  const query = useQuery({
    queryKey: ["partner", "bookings"],
    queryFn: async () => {
      try {
        return pageItems(await partners.listBookings()).map(toReservation);
      } catch {
        return data;
      }
    },
  });

  useEffect(() => {
    if (query.data) setReservations(query.data);
  }, [query.data, setReservations]);

  return {
    data,
    isLoading: query.isLoading && data.length === 0,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/** Bitta bron tafsiloti. */
export function useReservation(id: string) {
  const reservations = useReservations();
  const data = reservations.data.find((r) => r.id === id) ?? null;
  return { data, isLoading: reservations.isLoading };
}
