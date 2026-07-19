/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Tugash sanasi (ISO). Tugash kunini frontend hisoblaydi. */
  endsAt: string;
}

/**
 * Chegirmadagi takliflar — auto-scroll carousel (mobil 2 tadan).
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
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tugash vaqtini hisoblash uchun bir marta olingan timestamp (impure call emas).
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const el = ref.current;
    if (!el || deals.length < 3) return;

    timer.current = setInterval(() => {
      const cardW = el.clientWidth / 2;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft + cardW >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardW, behavior: "smooth" });
      }
    }, 6000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [deals.length]);

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

      <div
        ref={ref}
        className="scrollbar-none flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:hidden"
      >
        {deals.map((deal) => {
          const endsInDays = deal.endsAt
            ? Math.max(
                0,
                Math.ceil((Date.parse(deal.endsAt) - now) / 86_400_000),
              )
            : 0;
          return (
          <Link
            key={deal.id}
            href={`/${locale}/hotels/${deal.slug}`}
            className="group w-[calc(50%-0.375rem)] shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active">
              {/* Rasm */}
              <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
                <img
                  src={deal.imageUrl}
                  alt={deal.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Chegirma badge */}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-btn">
                  <Tag className="h-3 w-3" aria-hidden />
                  -{deal.discountPercent}%
                </span>

                {/* Timer badge */}
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-btn">
                  <Clock className="h-3 w-3" aria-hidden />
                  {endsInDays} {dict.days}
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
          );
        })}
      </div>

      <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4">
        {deals.slice(0, 4).map((deal) => {
          const endsInDays = deal.endsAt
            ? Math.max(0, Math.ceil((Date.parse(deal.endsAt) - now) / 86_400_000))
            : 0;
          return (
          <Link
            key={deal.id}
            href={`/${locale}/hotels/${deal.slug}`}
            className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active">
              <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
                <img
                  src={deal.imageUrl}
                  alt={deal.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-btn">
                  <Tag className="h-3 w-3" aria-hidden />
                  -{deal.discountPercent}%
                </span>
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-btn">
                  <Clock className="h-3 w-3" aria-hidden />
                  {endsInDays} {dict.days}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
                  {deal.name}
                </h3>
                <p className="text-xs text-slate-500">{deal.cityName}</p>
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
          );
        })}
      </div>
    </section>
  );
}
