import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getHotels } from "@/lib/api/hotels";
import { getCities } from "@/lib/api/catalog";
import { SearchBar } from "@/components/search/SearchBar";
import { HotelCard } from "@/components/hotels/HotelCard";
import type { HotelListItem } from "@/types/view";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const [common, dict] = await Promise.all([
    getDictionary(locale, "common"),
    getDictionary(locale, "home"),
  ]);

  // Parallel, alohida xato — biri yiqilsa ikkinchisi ko'rinadi.
  const cities = await getCities(locale).catch(() => []);
  const hotelsResult = await getHotels(locale, { limit: 6 }).catch(() => null);
  const loadFailed = hotelsResult === null;
  const hotels: HotelListItem[] = hotelsResult?.items ?? [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-12">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            {dict.hero.eyebrow}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {dict.hero.title}
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            {dict.hero.subtitle}
          </p>
        </div>

        <SearchBar locale={locale} dict={common.search} cities={cities} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{dict.featured.title}</h2>

        {loadFailed ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {dict.error.loadFailed}
          </p>
        ) : hotels.length === 0 ? (
          <p className="text-sm text-zinc-500">{dict.featured.empty}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                locale={locale}
                labels={{
                  perNight: dict.featured.perNight,
                  reviews: dict.featured.reviews,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
