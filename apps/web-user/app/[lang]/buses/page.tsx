import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getBusTrips } from "@/lib/api/buses";
import { getCities } from "@/lib/api/catalog";
import { BusSearchBar } from "@/components/bus/BusSearchBar";
import { BusTripCard } from "@/components/bus/BusTripCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang, "buses");
  return { title: dict.title };
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BusesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const sp = await searchParams;

  const dict = await getDictionary(locale, "buses");

  const fromCityId = one(sp.from_city_id);
  const toCityId = one(sp.to_city_id);
  const date = one(sp.date);

  // Parallel, lekin alohida xato: biri yiqilsa, ikkinchisi baribir ko'rinadi.
  const citiesPromise = getCities(locale).catch(() => []);
  const tripsPromise = getBusTrips(locale, { fromCityId, toCityId }).catch(
    () => null,
  );
  const cities = await citiesPromise;
  const trips = await tripsPromise;
  const loadFailed = trips === null;
  const items = trips ?? [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <BusSearchBar
        locale={locale}
        dict={dict.search}
        cities={cities}
        defaults={{ fromCityId, toCityId, date }}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>
        {!loadFailed && (
          <p className="text-sm text-slate-500">
            {dict.resultsCount.replace("{count}", String(items.length))}
          </p>
        )}
      </div>

      <section aria-label={dict.title}>
        {loadFailed ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {dict.error}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">{dict.empty}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((trip) => (
              <BusTripCard
                key={trip.id}
                trip={trip}
                locale={locale}
                labels={dict.card}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
