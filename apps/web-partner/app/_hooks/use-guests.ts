"use client";

import { useQuery } from "@tanstack/react-query";
import { mockDelay, mockGuests } from "../_lib/mocks/data";

export function useGuests() {
  return useQuery({
    queryKey: ["guests"],
    queryFn: () => mockDelay(mockGuests, 250),
  });
}
