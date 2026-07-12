/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";
import { resolveImage } from "@/lib/images";

export interface CityCardData {
  name: string;
  image: string;
  hotelCount: string;
  href: string;
}

export function CityCards({
  cities,
  dict,
}: {
  cities: CityCardData[];
  dict: HomeDict["popularCities"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (cities.length === 0) return null;

  function updateScrollButtons() {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scroll(dir: "left" | "right") {
    const el = ref.current;
    if (!el) return;
    const cardW = el.querySelector("a")?.clientWidth ?? 260;
    el.scrollBy({
      left: dir === "left" ? -(cardW + 12) : cardW + 12,
      behavior: "smooth",
    });
  }

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 sm:px-6"
      aria-labelledby="city-cards-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
        <div>
          <h2
            id="city-cards-heading"
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            {dict.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">
            {dict.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        onScroll={updateScrollButtons}
        className="scrollbar-none flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
      >
        {cities.map((city) => (
          <Link
            key={city.name}
            href={city.href}
            className="group relative w-[calc(50%-0.375rem)] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active sm:w-[220px] sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <div className="aspect-[3/4] overflow-hidden sm:aspect-4/3">
              <img
                src={resolveImage(city.image, city.name, 600, 450) ?? ""}
                alt={city.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"
              aria-hidden
            />

            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 md:p-4">
              <h3 className="text-sm font-bold text-white drop-shadow-sm sm:text-base md:text-lg">
                {city.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-white/75 sm:text-xs md:text-sm">
                {city.hotelCount} {dict.hotels}
              </p>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 transition-all duration-200 group-hover:ring-primary-400/50 sm:rounded-2xl"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
