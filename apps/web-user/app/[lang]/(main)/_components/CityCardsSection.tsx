import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { resolveImage } from "@/lib/images";
import type { Locale } from "@/i18n/config";
import type { HomeDict } from "@/i18n/dictionaries";

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

export async function CityCardsSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: HomeDict["popularCities"];
}) {
  const raw = await api.catalog.getPopularCities(locale).catch(() => []);
  const cities = raw
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8)
    .map((c) => ({
      name: c.name,
      image:
        resolveImage(c.imageUrl, c.slug, 600, 450) ??
        c.imageUrl ??
        KNOWN_CITY_IMAGES[c.slug.toLowerCase()] ??
        "/Uzbekistan-travel.jpeg",
      hotelCount: String(c.hotelCount),
      href: `/${locale}/hotels?city_id=${encodeURIComponent(c.slug)}`,
    }))
    .filter((c) => c.name);

  if (cities.length === 0) return null;

  return (
    <section aria-labelledby="city-cards-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <h2
            id="city-cards-heading"
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
          >
            {dict.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm dark:text-slate-400">
            {dict.subtitle}
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={city.href}
              className="group relative w-1/2 shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active sm:w-auto sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative aspect-[3/4] overflow-hidden sm:aspect-4/3">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  quality={85}
                />
              </div>

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                aria-hidden
              />

              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 md:p-4">
                <h3 className="text-sm font-bold text-white drop-shadow-sm sm:text-base md:text-lg">
                  {city.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-white/80 sm:text-xs md:text-sm">
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
    </section>
  );
}
