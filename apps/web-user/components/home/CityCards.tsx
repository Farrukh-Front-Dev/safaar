/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { HomeDict } from "@/i18n/dictionaries";

export interface CityCardData {
  name: string;
  image: string;
  hotelCount: string;
  href: string;
}

/**
 * Mashhur shaharlar — bosiladigan rasm kartalar.
 * Mobile-first: 2 ustun, sm: 2, md: 3, lg: 4.
 */
export function CityCards({
  cities,
  dict,
}: {
  cities: CityCardData[];
  dict: HomeDict["popularCities"];
}) {
  if (cities.length === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 sm:px-6"
      aria-labelledby="city-cards-heading"
    >
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

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {cities.map((city) => (
          <Link
            key={city.name}
            href={city.href}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {/* Rasm */}
            <div className="aspect-[3/4] overflow-hidden sm:aspect-4/3">
              <img
                src={city.image}
                alt={city.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Gradient overlay */}
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"
              aria-hidden
            />

            {/* Matn — rasm ustida, pastda */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 md:p-4">
              <h3 className="text-sm font-bold text-white drop-shadow-sm sm:text-base md:text-lg">
                {city.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-white/75 sm:text-xs md:text-sm">
                {city.hotelCount} {dict.hotels}
              </p>
            </div>

            {/* Hover ring */}
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
