"use client";

import { useDataStore } from "../_stores/data-store";

export function useRoomTypes() {
  const data = useDataStore((s) => s.roomTypes);
  return { data, isLoading: false };
}
