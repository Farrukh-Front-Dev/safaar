import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCities } from "@/lib/api/catalog";
import { getFeaturedHotels } from "@/lib/api/hotels";
import { getDeals, getPublicStats } from "@/lib/api/cms";
import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/search/SearchBar";
import { CityCardsSection } from "@/components/home/CityCardsSection";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedHotelsCarousel } from "@/components/home/FeaturedHotelsCarousel";
import { DealsSection, type DealItem } from "@/components/home/DealsSection";
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

  const cities = await getCities(locale).catch(() => []);
  const featuredResult = await getFeaturedHotels(locale, { limit: 4 }).catch(
    () => null,
  );
  let hotels: HotelListItem[] = featuredResult?.items ?? [];
  if (hotels.length === 0) {
    hotels = [
      { id: "mock-f1", slug: "tashkent-city-palace", name: "Tashkent City Palace", cityName: "Toshkent", stars: 5, rating: 4.8, reviewsCount: 234, minPriceSum: 650000, imageUrl: "/Tashkent-city-skyline.jpeg" },
      { id: "mock-f2", slug: "samarkand-plaza", name: "Samarkand Plaza", cityName: "Samarqand", stars: 5, rating: 4.7, reviewsCount: 189, minPriceSum: 520000, imageUrl: "/Samarkand-Registan-cinematic.jpeg" },
      { id: "mock-f3", slug: "grand-bukhara", name: "Grand Bukhara Hotel", cityName: "Buxoro", stars: 4, rating: 4.6, reviewsCount: 312, minPriceSum: 380000, imageUrl: "/Bukhara-old-city-golden-hour.jpeg" },
      { id: "mock-f4", slug: "khiva-ichan-kala", name: "Ichan-Kala Premier", cityName: "Xiva", stars: 4, rating: 4.9, reviewsCount: 156, minPriceSum: 450000, imageUrl: "/Khiva-Ichan-Kala-aerial.jpeg" },
      { id: "mock-f5", slug: "chimgan-alpine", name: "Chimgan Alpine Resort", cityName: "Chimgan", stars: 3, rating: 4.5, reviewsCount: 98, minPriceSum: 290000, imageUrl: "/Chimgan-mountains-landscape.jpeg" },
      { id: "mock-f6", slug: "charvak-lake", name: "Charvak Lake Hotel", cityName: "Charvak", stars: 3, rating: 4.4, reviewsCount: 143, minPriceSum: 350000, imageUrl: "/Charvak-Lake-drone.jpeg" },
    ];
  }

  const dealsResult = await getDeals(locale).catch(() => []);
  const deals: DealItem[] = dealsResult.map((d) => ({
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

  const stats = await getPublicStats().catch(() => null);

  return (
    <main className="relative flex flex-1 flex-col">

      {/* ═══ EKRAN 1: Hero + SearchBar + Featured Hotels ═══ */}
      <div className="flex min-h-svh flex-col justify-between">
        <Hero dict={dict.hero} />

        {/* Turar joy turlari filteri */}
        <div className="relative z-10">
          <SearchBar
            locale={locale}
            dict={common.search}
            cities={cities}
            propertyTypeLabels={common.propertyTypes}
          />

          {/* Quick city chips */}
          {cities.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-1.5 px-4 sm:mt-6 sm:gap-2">
              {cities.slice(0, 10).map((city) => (
                <a
                  key={city.id}
                  href={`/${locale}/hotels?city_id=${encodeURIComponent(city.id)}`}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-sm transition-all duration-150 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:scale-95 sm:px-3.5 sm:py-1.5 sm:text-xs"
                >
                  {city.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Tanlangan mehmonxonalar — auto-scroll carousel */}
        {hotels.length > 0 && (
          <FeaturedHotelsCarousel
            hotels={hotels}
            dict={dict.featured}
            locale={locale}
          />
        )}

        {/* Scroll ishora — birinchi ekran eng pastida */}
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
        <DealsSection deals={deals} dict={dict.deals} locale={locale} />
      </div>

      {/* ═══ EKRAN 3: City Cards (scroll qilganda) ═══ */}
      <div className="py-10 sm:py-16 md:py-20">
        <CityCardsSection locale={locale} dict={dict.popularCities} />
      </div>

      {/* ═══ EKRAN 4: Trust Bar ═══ */}
      <TrustBar dict={dict.trust} stats={stats} />
    </main>
  );
}
