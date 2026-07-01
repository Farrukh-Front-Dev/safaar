import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getHotels } from "@/lib/api/hotels";
import { getCities } from "@/lib/api/catalog";
import { Hero } from "@/components/home/Hero";
import { PopularCities } from "@/components/home/PopularCities";
import { WhyUzBron } from "@/components/home/WhyUzBron";
import { SearchBar } from "@/components/search/SearchBar";
import { HotelCard } from "@/components/hotels/HotelCard";
import type { HotelListItem } from "@/types/view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang, "home");
  return { title: dict.hero.title, description: dict.hero.subtitle };
}

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
    <main className="flex flex-1 flex-col">
      <Hero dict={dict.hero} />

      {/* Qidiruv kartasi hero ustiga "suzib" chiqadi. */}
      <div className="relative z-10 mx-auto -mt-12 w-full max-w-5xl px-6">
        <SearchBar locale={locale} dict={common.search} cities={cities} />
      </div>

      <div className="flex flex-col gap-16 py-16 sm:py-20">
        <PopularCities
          locale={locale}
          cities={cities}
          dict={dict.popularCities}
        />

        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {dict.featured.title}
              </h2>
              <p className="text-sm text-slate-500">{dict.featured.subtitle}</p>
            </div>
            <Link
              href={`/${locale}/hotels`}
              className="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              {dict.featured.all} →
            </Link>
          </div>

          {loadFailed ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              {dict.error.loadFailed}
            </p>
          ) : hotels.length === 0 ? (
            <p className="text-sm text-slate-500">{dict.featured.empty}</p>
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

        <WhyUzBron dict={dict.why} />
      </div>
    </main>
  );
}
