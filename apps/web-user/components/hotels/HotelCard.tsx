/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { resolveImage } from "@/lib/images";
import type { HotelListItem } from "@/types/view";

export interface HotelCardLabels {
  perNight: string;
  reviews: string;
}

/**
 * Mehmonxona kartasi — bosh sahifa va qidiruv natijalarida qayta ishlatiladi.
 * Presentational: ma'lumot + label'larni props orqali oladi.
 * Rasm: real (http) → dev placeholder foto → teal gradient (oxirgi chora).
 */
export function HotelCard({
  hotel,
  locale,
  labels,
}: {
  hotel: HotelListItem;
  locale: Locale;
  labels: HotelCardLabels;
}) {
  const imageUrl = resolveImage(hotel.imageUrl, hotel.id, 600, 450);

  return (
    <Link
      href={`/${locale}/hotels/${hotel.slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-primary-100 to-primary-300">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-primary-700/40">
              <BuildingIcon />
            </span>
          )}
          {hotel.rating > 0 && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-sm font-bold text-amber-600 shadow-sm backdrop-blur">
              <Star />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-snug">{hotel.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{hotel.cityName}</p>
          {hotel.stars > 0 && (
            <p className="mt-1 text-xs text-amber-500" aria-hidden>
              {"★".repeat(hotel.stars)}
            </p>
          )}
          <div className="mt-auto pt-3">
            <p className="text-lg font-bold tabular-nums text-slate-900">
              {formatSum(hotel.minPriceSum)}
              <span className="text-sm font-normal text-slate-500">
                {" "}
                / {labels.perNight}
              </span>
            </p>
            {hotel.reviewsCount > 0 && (
              <p className="text-xs text-slate-400">
                {hotel.reviewsCount} {labels.reviews}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12" aria-hidden>
      <path
        d="M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12M8 8h2M8 12h2M16 12h1M16 16h1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
