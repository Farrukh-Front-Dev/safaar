"use client";

import { useQuery } from "@tanstack/react-query";
import { buildFrontDeskStats, mockDelay } from "../_lib/mocks/data";

/** Front Desk dashboard KPI'lari. */
export function useFrontDeskStats() {
  return useQuery({
    queryKey: ["frontdesk", "stats"],
    queryFn: () => mockDelay(buildFrontDeskStats(), 250),
    retry: 0,
  });
}
