/**
 * Tarjima lug'atlarini yuklash.
 *
 * Tamoyil: **har bir sahifa (yoki bo'lim) uchun alohida JSON namespace**.
 * Masalan `common` (umumiy: header/footer), `home` (bosh sahifa). Yangi sahifa
 * qo'shsangiz: `locales/<lang>/<sahifa>.json` yarating va shu registratsiyaga
 * qator qo'shing.
 *
 * Lug'atlar faqat serverda yuklanadi (`server-only`) — JSON hajmi mijoz
 * bundle'iga tushmaydi.
 */
import "server-only";
import type { Locale } from "./config";

const loaders = {
  uz: {
    common: () => import("@/locales/uz/common.json"),
    home: () => import("@/locales/uz/home.json"),
    landing: () => import("@/locales/uz/landing.json"),
    hotels: () => import("@/locales/uz/hotels.json"),
    hotelDetail: () => import("@/locales/uz/hotelDetail.json"),
    auth: () => import("@/locales/uz/auth.json"),
    checkout: () => import("@/locales/uz/checkout.json"),
    booking: () => import("@/locales/uz/booking.json"),
    buses: () => import("@/locales/uz/buses.json"),
    busDetail: () => import("@/locales/uz/busDetail.json"),
    account: () => import("@/locales/uz/account.json"),
    static: () => import("@/locales/uz/static.json"),
    reviews: () => import("@/locales/uz/reviews.json"),
    favorites: () => import("@/locales/uz/favorites.json"),
    errors: () => import("@/locales/uz/errors.json"),
  },
  ru: {
    common: () => import("@/locales/ru/common.json"),
    home: () => import("@/locales/ru/home.json"),
    landing: () => import("@/locales/ru/landing.json"),
    hotels: () => import("@/locales/ru/hotels.json"),
    hotelDetail: () => import("@/locales/ru/hotelDetail.json"),
    auth: () => import("@/locales/ru/auth.json"),
    checkout: () => import("@/locales/ru/checkout.json"),
    booking: () => import("@/locales/ru/booking.json"),
    buses: () => import("@/locales/ru/buses.json"),
    busDetail: () => import("@/locales/ru/busDetail.json"),
    account: () => import("@/locales/ru/account.json"),
    static: () => import("@/locales/ru/static.json"),
    reviews: () => import("@/locales/ru/reviews.json"),
    favorites: () => import("@/locales/ru/favorites.json"),
    errors: () => import("@/locales/ru/errors.json"),
  },
  en: {
    common: () => import("@/locales/en/common.json"),
    home: () => import("@/locales/en/home.json"),
    landing: () => import("@/locales/en/landing.json"),
    hotels: () => import("@/locales/en/hotels.json"),
    hotelDetail: () => import("@/locales/en/hotelDetail.json"),
    auth: () => import("@/locales/en/auth.json"),
    checkout: () => import("@/locales/en/checkout.json"),
    booking: () => import("@/locales/en/booking.json"),
    buses: () => import("@/locales/en/buses.json"),
    busDetail: () => import("@/locales/en/busDetail.json"),
    account: () => import("@/locales/en/account.json"),
    static: () => import("@/locales/en/static.json"),
    reviews: () => import("@/locales/en/reviews.json"),
    favorites: () => import("@/locales/en/favorites.json"),
    errors: () => import("@/locales/en/errors.json"),
  },
} as const;

export type Namespace = keyof (typeof loaders)["uz"];

type DictModule<NS extends Namespace> = Awaited<
  ReturnType<(typeof loaders)["uz"][NS]>
>;
type Dict<NS extends Namespace> = DictModule<NS> extends { default: infer D }
  ? D
  : DictModule<NS>;

/** Komponent props'larida ishlatish uchun lug'at turlari. */
export type CommonDict = Dict<"common">;
export type HomeDict = Dict<"home">;
export type LandingDict = Dict<"landing">;
export type HotelsDict = Dict<"hotels">;
export type HotelDetailDict = Dict<"hotelDetail">;
export type AuthDict = Dict<"auth">;
export type CheckoutDict = Dict<"checkout">;
export type BookingDict = Dict<"booking">;
export type BusesDict = Dict<"buses">;
export type BusDetailDict = Dict<"busDetail">;
export type AccountDict = Dict<"account">;
export type StaticDict = Dict<"static">;
export type ReviewsDict = Dict<"reviews">;
export type FavoritesDict = Dict<"favorites">;
export type ErrorsDict = Dict<"errors">;

export async function getDictionary<NS extends Namespace>(
  locale: Locale,
  namespace: NS,
): Promise<Dict<NS>> {
  const mod = await loaders[locale][namespace]();
  return ("default" in mod ? mod.default : mod) as Dict<NS>;
}
