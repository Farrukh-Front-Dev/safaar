"use client";

import { useQuery } from "@tanstack/react-query";
import { mockDelay, mockRooms } from "../_lib/mocks/data";

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: () => mockDelay(mockRooms, 250),
  });
}
