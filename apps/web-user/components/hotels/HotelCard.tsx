/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import type { HotelListItem } from "@/types/view";

export interface HotelCardLabels {
  perNight: string;
  reviews: string;
}

/**
 * Mehmonxona kartasi — bosh sahifa va qidiruv natijalarida qayta ishlatiladi.
 * Presentational: ma'lumot + label'larni props orqali oladi.
 * Rasm bo'lmasa (backend hali fake yo'llar qaytaradi) — teal gradient placeholder.
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
  const hasImage = hotel.imageUrl?.startsWith("http");

  return (
    <Link
      href={`/${locale}/hotels/${hotel.slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-primary-100 to-primary-300">
          {hasImage ? (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-3xl font-bold text-primary-700/40">
              {hotel.name.charAt(0)}
            </span>
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-sm font-bold text-amber-600 shadow-sm backdrop-blur">
            <Star />
            {hotel.rating.toFixed(1)}
          </span>
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
            <p className="text-lg font-bold text-slate-900">
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
