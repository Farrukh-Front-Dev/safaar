"use client";

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
  const data = getStats();
  return { data, isLoading: false, refetch: () => {}, isFetching: false };
}
