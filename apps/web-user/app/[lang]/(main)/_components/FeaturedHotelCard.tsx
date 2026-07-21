import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
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
      className="group block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md transition-all duration-200 hover:border-blue-500 hover:shadow-xl active:bg-slate-50 active:scale-[0.98]">
        {/* Rasm */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Star className="h-8 w-8" />
            </div>
          )}

          {/* Reyting badge */}
          {hotel.rating > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-xl border-2 border-slate-300 bg-white/95 px-2 py-0.5 text-xs font-extrabold text-amber-700 shadow-xs backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <h3 className="line-clamp-1 text-sm font-extrabold text-slate-900">
            {hotel.name}
          </h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">{hotel.cityName}</p>

          {/* Narx */}
          <div className="mt-auto flex items-baseline gap-1 pt-2">
            <span className="text-base font-black tabular-nums text-slate-900">
              {formatSum(hotel.minPriceSum)}
            </span>
            <span className="text-xs font-bold text-slate-700">/ kecha</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
