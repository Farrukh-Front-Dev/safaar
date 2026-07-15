"use client";

import { useQuery } from "@tanstack/react-query";
import { pageItems, toRoom } from "../_lib/api/adapters";
import { partners } from "../_lib/api";
import { useDataStore } from "../_stores/data-store";
import { useAuthStore } from "../_stores/auth-store";

export function useRooms() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const fallback = useDataStore((s) => s.rooms);
  const query = useQuery({
    queryKey: ["partner", "rooms"],
    queryFn: async () => {
      try {
        const [hotel] = pageItems(await partners.listHotels(accessToken));
        if (!hotel) return fallback;
        const rawRooms = await partners.listRooms(hotel.id, accessToken);
        return rawRooms.map(toRoom);
      } catch {
        return fallback;
      }
    },
  });

  return { data: query.data ?? fallback, isLoading: query.isLoading && !query.data };
}
