/**
 * Backend avtobus javobini front view-model'ga aylantiruvchi adapter.
 *
 * Mehmonxona adapteri kabi 2 ta moslashuv:
 *  1. Ko'p tilli shahar nomi (`from_city.name: { uz, ru, en }`) → joriy til.
 *  2. Narx tiyin → so'm (`@/lib/money`).
 *
 * Backend `buses.service.ts` `tripSummary` shaklini qaytaradi:
 * `{ ...trip, route, company, from_city, to_city, available_seats }`.
 */
import { tiyinToSum } from "@/lib/money";
import type { Locale } from "@/i18n/config";
import type { BusSeatView, BusTripView } from "@/types/view";

type Localized = Partial<Record<Locale, string>> & Record<string, string>;

interface RawCity {
  id: string;
  name: Localized;
}

interface RawRoute {
  id: string;
  durationMinutes?: number;
}

interface RawCompany {
  id: string;
  name?: string;
  ratingAverage?: number;
  reviewsCount?: number;
}

interface RawTrip {
  id: string;
  departureAt?: string;
  arrivalAt?: string;
  vehicleName?: string;
  basePrice?: number;
  availableSeats?: number;
  route?: RawRoute;
  company?: RawCompany;
  fromCity?: RawCity;
  toCity?: RawCity;
}

interface RawSeat {
  id: string;
  seatCode?: string;
  seatClass?: string;
  price?: number;
  status?: string;
}

function pickLocale(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] ?? value.uz ?? Object.values(value)[0] ?? "";
}

export function toBusTripView(raw: RawTrip, locale: Locale): BusTripView {
  return {
    id: raw.id,
    fromCity: pickLocale(raw.fromCity?.name, locale),
    toCity: pickLocale(raw.toCity?.name, locale),
    departureAt: raw.departureAt ?? "",
    arrivalAt: raw.arrivalAt ?? "",
    durationMinutes: raw.route?.durationMinutes ?? 0,
    companyName: raw.company?.name ?? "",
    companyId: raw.company?.id ?? "",
    rating: raw.company?.ratingAverage ?? 0,
    vehicleName: raw.vehicleName ?? "",
    minPriceSum: tiyinToSum(raw.basePrice ?? 0),
    availableSeats: raw.availableSeats ?? 0,
  };
}

const SEAT_CLASSES = new Set(["standard", "comfort", "vip"]);
const SEAT_STATUSES = new Set(["available", "held", "booked", "blocked"]);

export function toBusSeatView(raw: RawSeat): BusSeatView {
  const seatClass = SEAT_CLASSES.has(raw.seatClass ?? "")
    ? (raw.seatClass as BusSeatView["seatClass"])
    : "standard";
  const status = SEAT_STATUSES.has(raw.status ?? "")
    ? (raw.status as BusSeatView["status"])
    : "blocked";

  return {
    id: raw.id,
    code: raw.seatCode ?? "",
    seatClass,
    priceSum: tiyinToSum(raw.price ?? 0),
    status,
  };
}
