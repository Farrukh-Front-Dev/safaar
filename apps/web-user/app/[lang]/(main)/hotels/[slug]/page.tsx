import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { api, ApiRequestError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { formatSum } from "@/lib/money";
import { HotelGallery } from "@/components/hotels/HotelGallery";
import { RoomList } from "@/components/hotels/RoomList";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { BackButton } from "@/components/ui/BackButton";

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function num(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// SENIOR OPTIMIZATION: Memoize getHotel request per request lifecycle using React cache()
// This prevents generateMetadata and HotelDetailPage from making duplicate HTTP calls to backend.
const getCachedHotel = cache(async (locale: Locale, slug: string) => {
  return api.hotels.getHotel(locale, slug).catch((error: unknown) => {
    if (error instanceof ApiRequestError && error.statusCode === 404) {
      return 404 as const;
    }
    return null;
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const hotel = await getCachedHotel(lang as Locale, slug);
  if (!hotel || hotel === 404) return {};
  return {
    title: `${hotel.name} — Safaar`,
    description: hotel.description?.slice(0, 160),
  };
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const sp = await searchParams;

  // SENIOR OPTIMIZATION: Fetch hotel data & dictionaries in parallel
  const [hotel, dict, favDict, reviewsDict, session, amenitiesRes] = await Promise.all([
    getCachedHotel(locale, slug),
    getDictionary(locale, "hotelDetail"),
    getDictionary(locale, "favorites"),
    getDictionary(locale, "reviews"),
    getSession(),
    api.catalog.getAmenities(locale).catch(() => []),
  ]);

  if (hotel === 404) {
    notFound();
  }

  if (!hotel) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-btn dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          {dict.error}
        </p>
      </main>
    );
  }

  // Secondary parallel requests requiring hotel.id
  const [favoriteId, reviews] = await Promise.all([
    session
      ? api.users.findFavoriteId(hotel.id, { token: session.accessToken }).catch(() => null)
      : Promise.resolve(null),
    api.reviews.getHotelReviews(hotel.id).catch(() => []),
  ]);

  const amenityName = new Map(amenitiesRes.map((a) => [a.id, a.name]));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
      <BackButton className="fixed left-4 top-16 z-50 md:left-8 md:top-20" />
      <HotelGallery images={hotel.images} alt={hotel.name} />

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{hotel.name}</h1>
          <span
            className="text-amber-600 dark:text-amber-400"
            aria-label={`Reyting ${hotel.rating.toFixed(1)}`}
          >
            ★ {hotel.rating.toFixed(1)}
          </span>
          <span aria-hidden className="text-sm text-amber-500">
            {"★".repeat(hotel.stars)}
          </span>
          <div className="ms-auto">
            <FavoriteButton
              targetType="hotel"
              targetId={hotel.id}
              initialFavoriteId={favoriteId}
              authed={!!session}
              loginHref={`/${locale}/login?next=${encodeURIComponent(
                `/${locale}/hotels/${slug}`,
              )}`}
              dict={favDict}
            />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {hotel.cityName}
          {hotel.address ? ` · ${hotel.address}` : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-8">
          {hotel.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{dict.about}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {hotel.description}
              </p>
            </section>
          )}

          {hotel.amenities.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{dict.amenities}</h2>
              <ul className="flex flex-wrap gap-2">
                {hotel.amenities.map((id) => (
                  <li
                    key={id}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-btn dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {amenityName.get(id) ?? id}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="rooms" className="flex scroll-mt-24 flex-col gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{dict.rooms}</h2>
            <RoomList
              rooms={hotel.rooms}
              locale={locale}
              hotelId={hotel.id}
              dict={dict}
              search={{
                checkIn: one(sp.check_in) ?? one(sp.checkIn),
                checkOut: one(sp.check_out) ?? one(sp.checkOut),
                guests: num(one(sp.guests)),
              }}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{dict.reviews}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hotel.reviewsCount > 0
                ? dict.ratingSummary.replace(
                    "{count}",
                    String(hotel.reviewsCount),
                  )
                : dict.noReviews}
            </p>
            <ReviewsList
              reviews={reviews}
              dict={reviewsDict}
              locale={locale}
            />
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-btn dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500">{dict.from}</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatSum(hotel.minPriceSum)}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                {" "}
                / {dict.perNight}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{dict.checkIn}</span>
              <span className="font-medium text-slate-900 dark:text-white">{hotel.checkInTime || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{dict.checkOut}</span>
              <span className="font-medium text-slate-900 dark:text-white">{hotel.checkOutTime || "—"}</span>
            </div>
          </div>
          <a
            href="#rooms"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent-600 px-6 font-bold text-white shadow-btn transition-all hover:bg-accent-500 hover:shadow-btn-hover active:bg-accent-700 active:scale-[0.97] active:shadow-btn-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            {dict.selectRoom}
          </a>
        </aside>
      </div>
    </main>
  );
}
