/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getPopularCities } from "@/lib/api/catalog";
import { resolveImage } from "@/lib/images";
import type { Locale } from "@/i18n/config";
import type { HomeDict } from "@/i18n/dictionaries";
import type { CityCardData } from "./CityCards";

const KNOWN_CITY_IMAGES: Record<string, string> = {
  toshkent: "/Tashkent-city-skyline.jpeg",
  samarqand: "/Samarkand-Registan-cinematic.jpeg",
  buxoro: "/Bukhara-old-city-golden-hour.jpeg",
  xiva: "/Khiva-Ichan-Kala-aerial.jpeg",
  fargona: "/Uzbekistan-travel.jpeg",
  namangan: "/Uzbekistan-travel.jpeg",
  charvak: "/Charvak-Lake-drone.jpeg",
  chimgan: "/Chimgan-mountains-landscape.jpeg",
  zaamin: "/Zaamin.jpeg",
  nukus: "/Uzbekistan-travel.jpeg",
};

export function CityCardsSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: HomeDict["popularCities"];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState<CityCardData[] | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        getPopularCities(locale)
          .then((data) => {
            const cards: CityCardData[] = data
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .slice(0, 8)
              .map((c) => ({
                name: c.name,
                image:
                  KNOWN_CITY_IMAGES[c.slug.toLowerCase()] ??
                  resolveImage(c.imageUrl, c.slug, 600, 450) ??
                  c.imageUrl,
                hotelCount: String(c.hotelCount),
                href: `/${locale}/hotels?city=${encodeURIComponent(c.slug)}`,
              }));
            setCities(cards);
          })
          .catch(() => setCities([]));
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [locale]);

  return (
    <section ref={sectionRef} aria-labelledby="city-cards-heading">
      {cities === null ? (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
            <div className="mb-1 h-7 w-48 rounded bg-slate-100 sm:h-8" />
            <div className="h-4 w-64 rounded bg-slate-100 sm:h-5" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100 sm:aspect-4/3"
              />
            ))}
          </div>
        </div>
      ) : cities.length === 0 ? null : (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={city.href}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
        </div>
      )}
    </section>
  );
}
