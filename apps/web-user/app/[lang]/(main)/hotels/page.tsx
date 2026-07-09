import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getHotels } from "@/lib/api/hotels";
import { getCities } from "@/lib/api/catalog";
import { SearchBar } from "@/components/search/SearchBar";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { HotelSortSelect } from "@/components/hotels/HotelSortSelect";
import { ActiveFilters } from "@/components/hotels/ActiveFilters";
import { HotelsPagination } from "@/components/hotels/HotelsPagination";
import { HotelCard } from "@/components/hotels/HotelCard";
import { Button } from "@/components/ui/Button";
import type { HotelListItem } from "@/types/view";

const PAGE_SIZE = 9;
const SORTS = ["price_asc", "price_desc", "rating"] as const;
type Sort = (typeof SORTS)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang, "hotels");
  return { title: dict.title };
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function int(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
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

  // ── searchParams validatsiyasi (xato/zararli qiymatlardan himoya) ──
  const cityId = one(sp.city_id);
  const starsRaw = int(one(sp.stars));
  const stars =
    starsRaw !== undefined && starsRaw >= 1 && starsRaw <= 5
      ? starsRaw
      : undefined;
  const minRaw = int(one(sp.min_price));
  const minPrice = minRaw !== undefined && minRaw >= 0 ? minRaw : undefined;
  const maxRaw = int(one(sp.max_price));
  const maxPrice = maxRaw !== undefined && maxRaw >= 0 ? maxRaw : undefined;
  const sortRaw = one(sp.sort);
  const sort = SORTS.includes(sortRaw as Sort) ? (sortRaw as Sort) : undefined;
  const page = Math.max(1, int(one(sp.page)) ?? 1);
  const checkIn = one(sp.check_in);
  const checkOut = one(sp.check_out);
  const guests = int(one(sp.guests));

  // ── Ma'lumot (alohida xato + log) ──
  const cities = await getCities(locale).catch((e: unknown) => {
    console.error("[hotels] getCities failed:", e);
    return [];
  });
  const hotelsResult = await getHotels(locale, {
    cityId,
    stars,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: PAGE_SIZE,
  }).catch((e: unknown) => {
    console.error("[hotels] getHotels failed:", e);
    return null;
  });
  const loadFailed = hotelsResult === null;

  // Backend server-side filter/sort/pagination qo'llaydi.
  const all: HotelListItem[] = hotelsResult?.items ?? [];
  const total = hotelsResult?.total ?? all.length;
  const totalPages = Math.max(1, hotelsResult?.totalPages ?? Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = all;

  // Pagination/CTA havolalari uchun joriy parametrlar.
  const basePath = `/${locale}/hotels`;
  const currentParams: Record<string, string> = {};
  if (cityId) currentParams.city_id = cityId;
  if (stars !== undefined) currentParams.stars = String(stars);
  if (minPrice !== undefined) currentParams.min_price = String(minPrice);
  if (maxPrice !== undefined) currentParams.max_price = String(maxPrice);
  if (sort) currentParams.sort = sort;
  if (checkIn) currentParams.check_in = checkIn;
  if (checkOut) currentParams.check_out = checkOut;
  if (guests) currentParams.guests = String(guests);

  // Bo'sh holatda "Filtrlarni tozalash" — city/sana saqlanadi.
  const clearedParams: Record<string, string> = {};
  if (cityId) clearedParams.city_id = cityId;
  if (checkIn) clearedParams.check_in = checkIn;
  if (checkOut) clearedParams.check_out = checkOut;
  if (guests) clearedParams.guests = String(guests);
  const clearedQuery = new URLSearchParams(clearedParams).toString();
  const clearedHref = `${basePath}${clearedQuery ? `?${clearedQuery}` : ""}`;
  const retryQuery = new URLSearchParams(currentParams).toString();
  const retryHref = `${basePath}${retryQuery ? `?${retryQuery}` : ""}`;

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-8 pt-20 sm:px-6 md:pt-28">

      <SearchBar
        locale={locale}
        dict={common.search}
        cities={cities}
        defaults={{ cityId, checkIn, checkOut, guests }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{dict.title}</h1>
            {!loadFailed && (
              <p aria-live="polite" className="text-xs text-slate-500 sm:text-sm">
                {dict.resultsCount.replace("{count}", String(total))}
              </p>
            )}
          </div>
          {!loadFailed && total > 0 && <HotelSortSelect dict={dict.sort} />}
        </div>
        <ActiveFilters dict={dict} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <HotelFilters dict={{ filters: dict.filters }} />

        <section aria-label={dict.title}>
          {loadFailed ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-800 shadow-btn">
              <p>{dict.error}</p>
              <Link href={retryHref}>
                <Button variant="secondary">{dict.retry}</Button>
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-btn">
              <p className="font-medium text-slate-700">{dict.empty}</p>
              <p className="text-sm text-slate-500">{dict.emptyHint}</p>
              <Link href={clearedHref}>
                <Button variant="secondary">{dict.clearFilters}</Button>
              </Link>
            </div>
          ) : (
            <>
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
              <HotelsPagination
                basePath={basePath}
                params={currentParams}
                page={safePage}
                totalPages={totalPages}
                dict={dict.pagination}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
