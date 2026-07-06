"use client";

import { useQuery } from "@tanstack/react-query";
import { pageItems, toRoomType } from "../_lib/api/adapters";
import { partners } from "../_lib/api";
import { useDataStore } from "../_stores/data-store";

export function useRoomTypes() {
  const fallback = useDataStore((s) => s.roomTypes);
  const query = useQuery({
    queryKey: ["partner", "room-types"],
    queryFn: async () => {
      try {
        const [hotel] = pageItems(await partners.listHotels());
        if (!hotel) return fallback;
        return (await partners.listRooms(hotel.id)).map(toRoomType);
      } catch {
        return fallback;
      }
    },
  });

  return { data: query.data ?? fallback, isLoading: query.isLoading && !query.data };
}
