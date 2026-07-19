import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { HomeDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";

/**
 * Mashhur yo'nalishlar — shahar chiplari. Bosilganda qidiruv natijalariga
 * (`/[lang]/hotels?city_id=...`) o'tadi. Shaharlar serverdan props orqali keladi.
 */
export function PopularCities({
  locale,
  cities,
  dict,
}: {
  locale: Locale;
  cities: CityOption[];
  dict: HomeDict["popularCities"];
}) {
  if (cities.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">{dict.title}</h2>
        <p className="text-sm text-slate-500">{dict.subtitle}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {cities.slice(0, 8).map((city) => (
          <li key={city.id}>
            <Link
              href={`/${locale}/hotels?city_id=${encodeURIComponent(city.id)}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {city.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
