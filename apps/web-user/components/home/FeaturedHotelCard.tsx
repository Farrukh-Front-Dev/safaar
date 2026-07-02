/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { resolveImage } from "@/lib/images";
import type { HotelListItem } from "@/types/view";

/**
 * Bosh sahifa "Featured offers" — minimal karta.
 * Faqat: rasm + nom + narx. Batafsil → bosilganda detal sahifasiga o'tadi.
 */
export function FeaturedHotelCard({
  hotel,
  locale,
}: {
  hotel: HotelListItem;
  locale: Locale;
}) {
  const img = resolveImage(hotel.imageUrl, hotel.id, 480, 320);

  return (
    <Link
      href={`/${locale}/hotels/${hotel.slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <article
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-[1.02]"
        style={{
          boxShadow:
            "0 2px 4px rgba(15,23,42,0.06), 0 8px 20px -4px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        {/* Rasm */}
        <div className="aspect-3/2 overflow-hidden bg-primary-50">
          {img ? (
            <img
              src={img}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary-200">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 17l5-5 4 4 5-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Nom + narx */}
        <div className="px-3 py-2.5">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {hotel.name}
          </h3>
          <p className="mt-1 text-sm font-bold tabular-nums text-primary-700">
            {formatSum(hotel.minPriceSum)}
          </p>
        </div>
      </article>
    </Link>
  );
}
