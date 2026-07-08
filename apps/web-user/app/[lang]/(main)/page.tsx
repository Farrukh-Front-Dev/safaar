import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCities } from "@/lib/api/catalog";
import { getHotels } from "@/lib/api/hotels";
import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/search/SearchBar";
import { CityCards, type CityCardData } from "@/components/home/CityCards";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedHotelCard } from "@/components/home/FeaturedHotelCard";
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
  const hotelsResult = await getHotels(locale, { limit: 6 }).catch(() => null);
  const realHotels: HotelListItem[] = hotelsResult?.items ?? [];

  // Backend 6 dan kam qaytarsa, demo mehmonxonalar bilan to'ldiramiz.
  const demoHotels: HotelListItem[] = [
    { id: "demo-1", slug: "samarkand-plaza", name: "Samarkand Plaza", cityName: "Samarqand", stars: 4, rating: 4.7, reviewsCount: 128, minPriceSum: 450000, imageUrl: "/Samarkand-Registan-cinematic.jpeg" },
    { id: "demo-2", slug: "grand-bukhara", name: "Grand Bukhara Hotel", cityName: "Buxoro", stars: 4, rating: 4.5, reviewsCount: 89, minPriceSum: 380000, imageUrl: "/Bukhara-old-city-golden-hour.jpeg" },
    { id: "demo-3", slug: "tashkent-city-palace", name: "Tashkent City Palace", cityName: "Toshkent", stars: 5, rating: 4.8, reviewsCount: 215, minPriceSum: 650000, imageUrl: "/Tashkent-city-skyline.jpeg" },
    { id: "demo-4", slug: "khiva-orient-star", name: "Orient Star Khiva", cityName: "Xiva", stars: 3, rating: 4.3, reviewsCount: 67, minPriceSum: 280000, imageUrl: "/Khiva-Ichan-Kala-aerial.jpeg" },
    { id: "demo-5", slug: "charvak-resort", name: "Charvak Oromgohi", cityName: "Charvak", stars: 4, rating: 4.6, reviewsCount: 54, minPriceSum: 520000, imageUrl: "/Charvak-Lake-drone.jpeg" },
    { id: "demo-6", slug: "chimgan-lodge", name: "Chimgan Mountain Lodge", cityName: "Chimgan", stars: 3, rating: 4.4, reviewsCount: 42, minPriceSum: 320000, imageUrl: "/Chimgan-mountains-landscape.jpeg" },
  ];
  const hotels: HotelListItem[] = realHotels.length >= 4 ? realHotels : [...realHotels, ...demoHotels].slice(0, 6);

  // Chegirmadagi takliflar (demo) — backend promo endpointi tayyor bo'lganda almashtiriladi.
  const deals: DealItem[] = [
    { id: "deal-1", slug: "samarkand-plaza", name: "Samarkand Plaza", cityName: "Samarqand", imageUrl: "/Samarkand-Registan-cinematic.jpeg", oldPriceSum: 450000, newPriceSum: 315000, discountPercent: 30, endsInDays: 3 },
    { id: "deal-2", slug: "grand-bukhara", name: "Grand Bukhara Hotel", cityName: "Buxoro", imageUrl: "/Bukhara-old-city-golden-hour.jpeg", oldPriceSum: 380000, newPriceSum: 285000, discountPercent: 25, endsInDays: 5 },
    { id: "deal-3", slug: "charvak-resort", name: "Charvak Oromgohi", cityName: "Charvak", imageUrl: "/Charvak-Lake-drone.jpeg", oldPriceSum: 520000, newPriceSum: 364000, discountPercent: 30, endsInDays: 2 },
    { id: "deal-4", slug: "tashkent-city-palace", name: "Tashkent City Palace", cityName: "Toshkent", imageUrl: "/Tashkent-city-skyline.jpeg", oldPriceSum: 650000, newPriceSum: 520000, discountPercent: 20, endsInDays: 7 },
  ];

  const cityCards: CityCardData[] = [
    { name: "Toshkent",   image: "/Tashkent-city-skyline.jpeg",          hotelCount: "200+", href: `/${locale}/hotels?city=tashkent` },
    { name: "Samarqand",  image: "/Samarkand-Registan-cinematic.jpeg",   hotelCount: "120+", href: `/${locale}/hotels?city=samarqand` },
    { name: "Buxoro",     image: "/Bukhara-old-city-golden-hour.jpeg",   hotelCount: "85+",  href: `/${locale}/hotels?city=bukhara` },
    { name: "Xiva",       image: "/Khiva-Ichan-Kala-aerial.jpeg",        hotelCount: "45+",  href: `/${locale}/hotels?city=khiva` },
    { name: "Charvak",    image: "/Charvak-Lake-drone.jpeg",             hotelCount: "30+",  href: `/${locale}/hotels?city=charvak` },
    { name: "Chimgan",    image: "/Chimgan-mountains-landscape.jpeg",    hotelCount: "25+",  href: `/${locale}/hotels?city=chimgan` },
    { name: "Zaamin",     image: "/Zaamin.jpeg",                         hotelCount: "15+",  href: `/${locale}/hotels?city=zaamin` },
    { name: "Nukus",      image: "/Uzbekistan-travel.jpeg",              hotelCount: "20+",  href: `/${locale}/hotels?city=nukus` },
  ];

  return (
    <main className="relative flex flex-1 flex-col">

      {/* ═══ EKRAN 1: Hero + SearchBar + Featured Hotels ═══ */}
      <div className="flex min-h-svh flex-col justify-between">
        <Hero dict={dict.hero} />

        {/* SearchTabs (Mehmonxona / Avtobus) */}
        <div className="relative z-10 mx-auto mt-4 w-full max-w-4xl px-3 sm:mt-6 sm:px-6">
          <SearchBar locale={locale} dict={common.search} cities={cities} />

          {/* Quick city chips */}
          {cities.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:mt-5 sm:gap-2">
              {cities.slice(0, 6).map((city) => (
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

        {/* Tanlangan mehmonxonalar — gorizontal scroll */}
        {hotels.length > 0 && (
          <section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:mt-8 sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-base font-bold tracking-tight sm:text-lg">
                {dict.featured.title}
              </h2>
              <Link
                href={`/${locale}/hotels`}
                className="shrink-0 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:text-sm"
              >
                {dict.featured.all} →
              </Link>
            </div>
            <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
              {hotels.slice(0, 4).map((hotel) => (
                <div key={hotel.id} className="min-w-[220px] flex-1">
                  <FeaturedHotelCard
                    hotel={hotel}
                    locale={locale}
                  />
                </div>
              ))}
            </div>
          </section>
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
        <CityCards cities={cityCards} dict={dict.popularCities} />
      </div>

      {/* ═══ EKRAN 4: Trust Bar ═══ */}
      <TrustBar dict={dict.trust} />
    </main>
  );
}
