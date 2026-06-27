"use client";

import { useQuery } from "@tanstack/react-query";
import { mockDelay, mockReservations } from "../_lib/mocks/data";

/** Barcha bronlar (filter UI tomonida). */
export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: () => mockDelay(mockReservations, 250),
  });
}

/** Bitta bron tafsiloti. */
export function useReservation(id: string) {
  return useQuery({
    queryKey: ["reservations", id],
    queryFn: () =>
      mockDelay(
        mockReservations.find((r) => r.id === id) ?? null,
        200,
      ),
    enabled: Boolean(id),
  });
}
