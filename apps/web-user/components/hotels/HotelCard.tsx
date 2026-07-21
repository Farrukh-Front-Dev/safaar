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
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-300/90 bg-white shadow-xs transition-all duration-200 hover:border-blue-500 hover:shadow-lg active:scale-[0.98]">
        {/* Rasm */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
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
            <span className="absolute inset-0 grid place-items-center text-slate-400">
              <Building2 className="h-12 w-12" aria-hidden />
            </span>
          )}

          {/* Yagona reyting badge — rasm tepasida */}
          {hotel.rating > 0 && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white/95 px-2.5 py-1 text-xs font-black text-amber-700 shadow-xs backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-1">{hotel.name}</h3>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            {hotel.cityName}
            {hotel.stars > 0 && ` • ${hotel.stars}★`}
          </p>

          {/* Narx va sharhlar */}
          <div className="mt-auto pt-3 border-t border-slate-200">
            <p className="text-lg font-black tabular-nums text-slate-900">
              {formatSum(hotel.minPriceSum)}
              <span className="text-xs font-bold text-slate-700">
                {" "}
                / {labels.perNight}
              </span>
            </p>
            {hotel.reviewsCount > 0 && (
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {hotel.reviewsCount} {labels.reviews}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
