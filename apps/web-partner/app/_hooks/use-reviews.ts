"use client";

import { useQuery } from "@tanstack/react-query";
import { mockDelay, mockReviews } from "../_lib/mocks/data";

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () => mockDelay(mockReviews, 250),
  });
}
