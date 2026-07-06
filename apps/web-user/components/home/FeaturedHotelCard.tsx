/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Star, Flame } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { resolveImage } from "@/lib/images";
import type { HotelListItem } from "@/types/view";

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
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08),0_8px_24px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(15,23,42,0.1),0_16px_32px_-6px_rgba(15,23,42,0.16)] active:scale-[0.97]">
        {/* Rasm */}
        <div className="relative aspect-4/3 overflow-hidden bg-primary-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary-300">
              <Star className="h-8 w-8" />
            </div>
          )}

          {/* "Mashhur" featured badge — yuqori o'ng burchak */}
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
            <Flame className="h-3 w-3" aria-hidden />
            Mashhur
          </span>

          {/* Reyting badge — yuqori chap burchak */}
          {hotel.rating > 0 && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 shadow-sm backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" aria-hidden />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
            {hotel.name}
          </h3>
          <p className="text-xs text-slate-500">{hotel.cityName}</p>

          {/* Narx — ajratilgan blok */}
          <div className="mt-auto flex items-baseline gap-1.5 rounded-lg bg-primary-50/60 px-2 py-1.5 pt-2">
            <span className="text-sm font-bold tabular-nums text-primary-700">
              {formatSum(hotel.minPriceSum)}
            </span>
            <span className="text-[11px] text-slate-400">/ kecha</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
