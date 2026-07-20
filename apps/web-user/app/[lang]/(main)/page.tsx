import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { api } from "@/lib/api";
import { SearchBar } from "@/components/search/SearchBar";
import { Hero } from "./_components/Hero";
import { CityCardsSection } from "./_components/CityCardsSection";
import { TrustBar } from "./_components/TrustBar";
import { FeaturedHotelsCarousel } from "./_components/FeaturedHotelsCarousel";
import { DealsSection, type DealItem } from "./_components/DealsSection";
import { WhySafaar } from "./_components/WhySafaar";
import { PartnersShowcase } from "./_components/PartnersShowcase";
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

const FEATURED_FALLBACK: HotelListItem[] = [
  { id: "mock-f1", slug: "tashkent-city-palace", name: "Tashkent City Palace", cityName: "Toshkent", stars: 5, rating: 4.8, reviewsCount: 234, minPriceSum: 650000, imageUrl: "/Tashkent-city-skyline.jpeg" },
  { id: "mock-f2", slug: "samarkand-plaza", name: "Samarkand Plaza", cityName: "Samarqand", stars: 5, rating: 4.7, reviewsCount: 189, minPriceSum: 520000, imageUrl: "/Samarkand-Registan-cinematic.jpeg" },
  { id: "mock-f3", slug: "grand-bukhara", name: "Grand Bukhara Hotel", cityName: "Buxoro", stars: 4, rating: 4.6, reviewsCount: 312, minPriceSum: 380000, imageUrl: "/Bukhara-old-city-golden-hour.jpeg" },
  { id: "mock-f4", slug: "khiva-ichan-kala", name: "Ichan-Kala Premier", cityName: "Xiva", stars: 4, rating: 4.9, reviewsCount: 156, minPriceSum: 450000, imageUrl: "/Khiva-Ichan-Kala-aerial.jpeg" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  // SENIOR OPTIMIZATION 1: Parallelize dictionary and API requests to remove waterfall latency
  const [common, dict, [citiesRes, featuredRes, dealsRes, statsRes]] = await Promise.all([
    getDictionary(locale, "common"),
    getDictionary(locale, "home"),
    Promise.allSettled([
      api.catalog.getCities(locale),
      api.hotels.getFeaturedHotels(locale, { limit: 4 }),
      api.cms.getDeals(locale),
      api.cms.getPublicStats(),
    ]),
  ]);

  const cities = citiesRes.status === "fulfilled" ? citiesRes.value : [];
  const featuredResult = featuredRes.status === "fulfilled" ? featuredRes.value : null;
  const rawDeals = dealsRes.status === "fulfilled" ? dealsRes.value : [];
  const stats = statsRes.status === "fulfilled" ? statsRes.value : null;

  const fromApi = featuredResult?.items ?? [];
  const hotels: HotelListItem[] = [...fromApi];
  for (const fallback of FEATURED_FALLBACK) {
    if (hotels.length >= 4) break;
    if (hotels.some((h) => h.id === fallback.id || h.slug === fallback.slug)) continue;
    hotels.push(fallback);
  }

  const deals: DealItem[] = rawDeals.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    cityName: d.cityName,
    imageUrl: d.imageUrl,
    oldPriceSum: d.oldPriceSum,
    newPriceSum: d.newPriceSum,
    discountPercent: d.discountPercent,
    endsAt: d.endsAt,
  }));

  return (
    <main className="relative flex flex-1 flex-col">
      {/* ═══ EKRAN 1: Hero + SearchBar + Featured Hotels ═══ */}
      <div className="flex min-h-svh flex-col justify-between">
        <Hero dict={dict.hero} />

        <div className="relative z-10">
          <section id="search-section" className="bg-slate-50 pb-10 pt-6 sm:pb-14 sm:pt-8 dark:bg-slate-900/50">
            <div className="mx-auto max-w-4xl px-4">
              <SearchBar locale={locale} dict={common.search} cities={cities} />
            </div>
          </section>

          {/* Quick city chips: Next.js <Link> for SPA navigation instead of hard page reload */}
          {cities.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-1.5 px-4 sm:mt-6 sm:gap-2">
              {cities.slice(0, 10).map((city) => (
                <Link
                  key={city.id}
                  href={`/${locale}/hotels?city_id=${encodeURIComponent(city.id)}`}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-sm transition-all duration-150 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:scale-95 sm:px-3.5 sm:py-1.5 sm:text-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tanlangan mehmonxonalar — auto-scroll carousel */}
        {hotels.length > 0 && (
          <Suspense fallback={<div className="h-48 w-full animate-pulse bg-slate-100 dark:bg-slate-900" />}>
            <FeaturedHotelsCarousel
              hotels={hotels}
              dict={dict.featured}
              locale={locale}
            />
          </Suspense>
        )}

        {/* Scroll indicator */}
        <div className="flex justify-center pb-4 pt-4 sm:pb-6 sm:pt-6">
          <div className="flex animate-bounce flex-col items-center gap-0.5 text-slate-400">
            <span className="text-[10px] font-medium sm:text-xs">
              {dict.popularCities.title}
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden>
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ═══ EKRAN 2: Chegirmadagi takliflar ═══ */}
      <div className="py-10 sm:py-14">
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-900" />}>
          <DealsSection deals={deals} dict={dict.deals} locale={locale} />
        </Suspense>
      </div>

      {/* ═══ EKRAN 3: Why Safaar ═══ */}
      <WhySafaar dict={dict.why} />

      {/* ═══ EKRAN 4: City Cards (scroll qilganda) ═══ */}
      <div className="py-10 sm:py-16 md:py-20">
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-900" />}>
          <CityCardsSection locale={locale} dict={dict.popularCities} />
        </Suspense>
      </div>

      {/* ═══ EKRAN 5: Ishonchli hamkorlar ═══ */}
      <PartnersShowcase dict={dict.partners} />

      {/* ═══ EKRAN 6: Trust Bar ═══ */}
      <TrustBar dict={dict.trust} stats={stats} />
    </main>
  );
}
