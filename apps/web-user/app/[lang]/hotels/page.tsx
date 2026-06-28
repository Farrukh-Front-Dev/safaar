import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getHotels } from "@/lib/api/hotels";
import { getCities } from "@/lib/api/catalog";
import { SearchBar } from "@/components/search/SearchBar";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { HotelCard } from "@/components/hotels/HotelCard";
import type { HotelListItem } from "@/types/view";

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function num(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function HotelsPage({
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

  const [common, dict] = await Promise.all([
    getDictionary(locale, "common"),
    getDictionary(locale, "hotels"),
  ]);

  const cityId = one(sp.city_id);
  const stars = num(one(sp.stars));
  const minPrice = num(one(sp.min_price));
  const maxPrice = num(one(sp.max_price));
  const sort = one(sp.sort);

  // Parallel, lekin alohida xato: biri yiqilsa, ikkinchisi baribir ko'rinadi.
  const citiesPromise = getCities(locale).catch(() => []);
  const hotelsPromise = getHotels(locale, { cityId, stars }).catch(() => null);
  const cities = await citiesPromise;
  const hotelsResult = await hotelsPromise;
  const loadFailed = hotelsResult === null;

  // Backend `findAll` narx-filtr va saralashni qo'llamaydi — frontda qo'llaymiz.
  let items: HotelListItem[] = hotelsResult?.items ?? [];
  if (minPrice !== undefined) {
    items = items.filter((h) => h.minPriceSum >= minPrice);
  }
  if (maxPrice !== undefined) {
    items = items.filter((h) => h.minPriceSum <= maxPrice);
  }
  if (sort === "price_asc") {
    items = [...items].sort((a, b) => a.minPriceSum - b.minPriceSum);
  } else if (sort === "price_desc") {
    items = [...items].sort((a, b) => b.minPriceSum - a.minPriceSum);
  } else if (sort === "rating") {
    items = [...items].sort((a, b) => b.rating - a.rating);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <SearchBar
        locale={locale}
        dict={common.search}
        cities={cities}
        defaults={{
          cityId,
          checkIn: one(sp.check_in),
          checkOut: one(sp.check_out),
          guests: num(one(sp.guests)),
        }}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>
        {!loadFailed && (
          <p className="text-sm text-slate-500">
            {dict.resultsCount.replace("{count}", String(items.length))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <HotelFilters dict={{ filters: dict.filters, sort: dict.sort }} />

        <section aria-label={dict.title}>
          {loadFailed ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              {dict.error}
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">{dict.empty}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  locale={locale}
                  labels={{ perNight: dict.perNight, reviews: dict.reviews }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
