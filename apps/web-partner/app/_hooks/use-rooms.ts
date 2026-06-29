"use client";

import { useDataStore } from "../_stores/data-store";

export function useRooms() {
  const data = useDataStore((s) => s.rooms);
  return { data, isLoading: false };
}
