import type { Hotel } from "@safaar/types";
import { request } from "../client";

/** Barcha mehmonxonalar (public). */
export function listHotels(): Promise<Hotel[]> {
  return request<Hotel[]>("/hotels");
}

/** Bitta mehmonxona tafsiloti. */
export function getHotel(id: string): Promise<Hotel> {
  return request<Hotel>(`/hotels/${encodeURIComponent(id)}`);
}
