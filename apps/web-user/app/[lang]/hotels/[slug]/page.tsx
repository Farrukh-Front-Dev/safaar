import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getHotel } from "@/lib/api/hotels";
import { getAmenities } from "@/lib/api/catalog";
import { ApiRequestError } from "@/lib/api";
import { HotelGallery } from "@/components/hotels/HotelGallery";
import { RoomList } from "@/components/hotels/RoomList";

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function num(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  try {
    const hotel = await getHotel(lang, slug);
    return {
      title: `${hotel.name} — UzBron`,
      description: hotel.description?.slice(0, 160),
    };
  } catch {
    return {};
  }
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

  const dict = await getDictionary(locale, "hotelDetail");

  // 404 → notFound(); boshqa xato → null (xato holati ko'rsatiladi).
  const hotel = await getHotel(locale, slug).catch((error: unknown) => {
    if (error instanceof ApiRequestError && error.statusCode === 404) {
      notFound();
    }
    return null;
  });

  if (!hotel) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {dict.error}
        </p>
      </main>
    );
  }

  const amenities = await getAmenities(locale).catch(() => []);
  const amenityName = new Map(amenities.map((a) => [a.id, a.name]));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
      <HotelGallery images={hotel.images} alt={hotel.name} />

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{hotel.name}</h1>
          <span
            className="text-amber-600"
            aria-label={`Reyting ${hotel.rating.toFixed(1)}`}
          >
            ★ {hotel.rating.toFixed(1)}
          </span>
          <span aria-hidden className="text-sm text-amber-500">
            {"★".repeat(hotel.stars)}
          </span>
        </div>
        <p className="text-zinc-500">
          {hotel.cityName}
          {hotel.address ? ` · ${hotel.address}` : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-8">
          {hotel.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">{dict.about}</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {hotel.description}
              </p>
            </section>
          )}

          {hotel.amenities.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">{dict.amenities}</h2>
              <ul className="flex flex-wrap gap-2">
                {hotel.amenities.map((id) => (
                  <li
                    key={id}
                    className="rounded-full border border-black/10 px-3 py-1 text-sm text-zinc-700 dark:border-white/15 dark:text-zinc-300"
                  >
                    {amenityName.get(id) ?? id}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">{dict.rooms}</h2>
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
            <h2 className="text-xl font-semibold">{dict.reviews}</h2>
            <p className="text-sm text-zinc-500">
              {hotel.reviewsCount > 0
                ? dict.ratingSummary.replace(
                    "{count}",
                    String(hotel.reviewsCount),
                  )
                : dict.noReviews}
            </p>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{dict.checkIn}</span>
            <span className="font-medium">{hotel.checkInTime || "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{dict.checkOut}</span>
            <span className="font-medium">{hotel.checkOutTime || "—"}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
