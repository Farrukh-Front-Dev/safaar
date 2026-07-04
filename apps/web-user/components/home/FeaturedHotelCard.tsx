/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Star } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { resolveImage } from "@/lib/images";
import type { HotelListItem } from "@/types/view";

/**
 * Ixcham mehmonxona kartasi — bosh sahifa featured section uchun.
 * Gorizontal scroll'da ko'rinadi. Minimal, tez yuklanadi.
 */
export function FeaturedHotelCard({
  hotel,
  locale,
}: {
  hotel: HotelListItem;
  locale: Locale;
}) {
  const imageUrl = resolveImage(hotel.imageUrl, hotel.id, 400, 300);

  return (
    <Link
      href={`/${locale}/hotels/${hotel.slug}`}
      className="group block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <article
        className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition-all duration-300 group-hover:-translate-y-1 group-active:translate-y-0 group-active:scale-[0.97]"
        style={{
          transform: "perspective(800px) rotateX(2deg)",
          boxShadow:
            "0 8px 16px -4px rgba(15,23,42,0.12), 0 20px 40px -8px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(15,23,42,0.04)",
        }}
      >
        {/* Rasm */}
        <div className="relative aspect-[4/3] overflow-hidden bg-primary-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary-300">
              <Star className="h-8 w-8" />
            </div>
          )}
          {/* Reyting badge */}
          {hotel.rating > 0 && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 shadow-sm backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" aria-hidden />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
          <h3 className="line-clamp-1 text-xs font-semibold text-slate-900 sm:text-sm">
            {hotel.name}
          </h3>
          <p className="text-[10px] text-slate-500 sm:text-xs">{hotel.cityName}</p>
          <p className="mt-auto pt-1 text-xs font-bold tabular-nums text-slate-900 sm:text-sm">
            {formatSum(hotel.minPriceSum)}
            <span className="font-normal text-slate-400"> / kecha</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
