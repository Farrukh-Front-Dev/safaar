/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Tag, Clock } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { HomeDict } from "@/i18n/dictionaries";
import { formatSum } from "@/lib/money";

export interface DealItem {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  imageUrl: string;
  /** Chegirmasiz narx (so'm). */
  oldPriceSum: number;
  /** Chegirmali narx (so'm). */
  newPriceSum: number;
  /** Chegirma foizi. */
  discountPercent: number;
  /** Tugash sanasigacha qolgan kunlar. */
  endsInDays: number;
}

/**
 * Chegirmadagi takliflar — horizontal scroll kartalar.
 * Agoda'ning "Today's deals" bo'limiga o'xshash.
 */
export function DealsSection({
  deals,
  dict,
  locale,
}: {
  deals: DealItem[];
  dict: HomeDict["deals"];
  locale: Locale;
}) {
  if (deals.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {dict.title}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {dict.subtitle}
        </p>
      </div>

      <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2 sm:gap-4">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={`/${locale}/hotels/${deal.slug}`}
            className="group min-w-[260px] flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]">
              {/* Rasm */}
              <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
                <img
                  src={deal.imageUrl}
                  alt={deal.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Chegirma badge */}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                  <Tag className="h-3 w-3" aria-hidden />
                  -{deal.discountPercent}%
                </span>

                {/* Timer badge */}
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <Clock className="h-3 w-3" aria-hidden />
                  {deal.endsInDays} {dict.days}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
                  {deal.name}
                </h3>
                <p className="text-xs text-slate-500">{deal.cityName}</p>

                {/* Narxlar */}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <span className="text-xs text-slate-400 line-through">
                    {formatSum(deal.oldPriceSum)}
                  </span>
                  <span className="text-base font-bold text-red-600">
                    {formatSum(deal.newPriceSum)}
                  </span>
                  <span className="text-[10px] text-slate-400">{dict.perNight}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
