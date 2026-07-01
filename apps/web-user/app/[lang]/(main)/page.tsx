import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCities } from "@/lib/api/catalog";
import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/search/SearchBar";
import { CityCards, type CityCardData } from "@/components/home/CityCards";
import { TrustBar } from "@/components/home/TrustBar";

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
      {/* Fixed gradient — butun sahifa foni */}
      <div
        className="fixed inset-0 -z-10 bg-linear-to-b from-primary-50 via-white via-45% to-primary-800"
        aria-hidden
      />

      {/* ═══ EKRAN 1: Hero + SearchBar ═══ */}
      <div className="flex min-h-svh flex-col justify-between">
        <Hero dict={dict.hero} />

        {/* SearchBar */}
        <div className="relative z-10 mx-auto -mt-12 w-full max-w-4xl px-3 sm:-mt-20 sm:px-6 md:-mt-28 lg:-mt-36">
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

        {/* Scroll ishora */}
        <div className="flex justify-center pb-4 pt-6 sm:pb-6 sm:pt-8">
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

      {/* ═══ EKRAN 2: City Cards ═══ */}
      <div className="py-10 sm:py-16 md:py-20">
        <CityCards cities={cityCards} dict={dict.popularCities} />
      </div>

      {/* ═══ EKRAN 3: Trust Bar ═══ */}
      <TrustBar dict={dict.trust} />
    </main>
  );
}
