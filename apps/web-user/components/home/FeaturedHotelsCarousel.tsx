"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FeaturedHotelCard } from "./FeaturedHotelCard";
import type { HotelListItem } from "@/types/view";
import type { Locale } from "@/i18n/config";
import type { HomeDict } from "@/i18n/dictionaries";

export function FeaturedHotelsCarousel({
  hotels,
  dict,
  locale,
}: {
  hotels: HotelListItem[];
  dict: HomeDict["featured"];
  locale: Locale;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || hotels.length < 3) return;

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
  }, [hotels.length]);

  return (
    <section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:mt-8 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-bold tracking-tight sm:text-lg">
          {dict.title}
        </h2>
        <Link
          href={`/${locale}/hotels`}
          className="shrink-0 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:text-sm"
        >
          {dict.all} →
        </Link>
      </div>
      <div
        ref={ref}
        className="scrollbar-none flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
      >
        {hotels.slice(0, 6).map((hotel) => (
          <div
            key={hotel.id}
            className="w-[calc(50%-0.375rem)] shrink-0 snap-start sm:w-auto sm:flex-1 sm:min-w-[220px]"
          >
            <FeaturedHotelCard hotel={hotel} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}
