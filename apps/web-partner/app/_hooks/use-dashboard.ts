"use client";

import { useQuery } from "@tanstack/react-query";
import { toFrontDeskStats } from "../_lib/api/adapters";
import { partners } from "../_lib/api";
import { useDataStore } from "../_stores/data-store";

/** Front Desk dashboard KPI'lari — store'dan reaktiv hisoblanadi. */
export function useFrontDeskStats() {
  // Reservations va rooms o'zgarganda statistika ham yangilanadi
  const reservations = useDataStore((s) => s.reservations);
  const rooms = useDataStore((s) => s.rooms);
  const getStats = useDataStore((s) => s.getStats);
  // Reactive bog'liqliklar: reservations va rooms o'zgarganda re-render
  void reservations;
  void rooms;
  const fallback = getStats();
  const query = useQuery({
    queryKey: ["partner", "dashboard"],
    queryFn: async () => {
      try {
        return toFrontDeskStats(await partners.getRawDashboard());
      } catch {
        return fallback;
      }
    },
  });

  return {
    data: query.data ?? fallback,
    isLoading: query.isLoading && !query.data,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
