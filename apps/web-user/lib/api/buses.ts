/**
 * Avtobus endpointlari (USER, ochiq) — markaziy `api` client + adapter ustida.
 * Endpointlar: backend `buses.controller.ts`.
 *
 * Mehmonxonadagi kabi: backend `snake_case`, ko'p tilli va tiyindagi javobni
 * `camelizeKeys` + adapter orqali UI uchun tayyor view-model'ga aylantiramiz.
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import { toBusSeatView, toBusTripView } from "@/lib/adapters/bus";
import type { Locale } from "@/i18n/config";
import type { BusSeatView, BusTripView } from "@/types/view";

export interface BusTripParams {
  fromCityId?: string;
  toCityId?: string;
}

/** `GET /bus-trips` — rejalashtirilgan reyslar (shahar bo'yicha filtr). */
export async function getBusTrips(
  locale: Locale,
  params: BusTripParams = {},
): Promise<BusTripView[]> {
  const raw = await api.get<unknown>("/bus-trips", {
    query: {
      from_city_id: params.fromCityId,
      to_city_id: params.toCityId,
    },
    // Reyslar tez-tez o'zgarmaydi — qisqa ISR (CWV uchun).
    next: { revalidate: 60 },
  });

  const items = camelizeKeys<unknown[]>(raw);
  return (items ?? []).map((item) => toBusTripView(item as never, locale));
}

/** `GET /bus-trips/:id` — bitta reys (kompaniya, shahar, bo'sh joylar bilan). */
export async function getBusTrip(
  locale: Locale,
  id: string,
): Promise<BusTripView> {
  const raw = await api.get<unknown>(`/bus-trips/${encodeURIComponent(id)}`);
  return toBusTripView(camelizeKeys(raw) as never, locale);
}

/** `GET /bus-trips/:id/seats` — reysdagi barcha o'rindiqlar. */
export async function getBusSeats(id: string): Promise<BusSeatView[]> {
  const raw = await api.get<unknown>(
    `/bus-trips/${encodeURIComponent(id)}/seats`,
  );
  const items = camelizeKeys<unknown[]>(raw);
  return (items ?? []).map((item) => toBusSeatView(item as never));
}
