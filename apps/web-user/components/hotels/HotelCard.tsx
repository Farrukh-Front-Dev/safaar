import Link from "next/link";
import Image from "next/image";
import { Star, Building2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { resolveImage } from "@/lib/images";
import type { HotelListItem } from "@/types/view";

export interface HotelCardLabels {
  perNight: string;
  reviews: string;
}

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
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80">
        <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-primary-100 to-primary-300 dark:from-slate-800 dark:to-slate-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={85}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-primary-700/40 dark:text-primary-400/40">
              <Building2 className="h-12 w-12" aria-hidden />
            </span>
          )}
          {hotel.rating > 0 && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-sm font-bold text-amber-600 shadow-btn backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/90 dark:text-amber-400">
              <Star className="h-4 w-4 fill-current" aria-hidden />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{hotel.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{hotel.cityName}</p>
          {hotel.stars > 0 && (
            <p className="mt-1 text-xs text-amber-500" aria-hidden>
              {"★".repeat(hotel.stars)}
            </p>
          )}
          <div className="mt-auto pt-3">
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {formatSum(hotel.minPriceSum)}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                {" "}
                / {labels.perNight}
              </span>
            </p>
            {hotel.reviewsCount > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {hotel.reviewsCount} {labels.reviews}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
