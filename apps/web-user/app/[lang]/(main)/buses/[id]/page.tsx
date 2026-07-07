import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getBusTrip, getBusSeats } from "@/lib/api/buses";
import { getBusCompanyReviews } from "@/lib/api/reviews";
import { ApiRequestError } from "@/lib/api";
import { formatTime, formatDuration } from "@/lib/datetime";
import { SeatPicker } from "@/components/bus/SeatPicker";
import { ReviewsList } from "@/components/reviews/ReviewsList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  try {
    const trip = await getBusTrip(lang, id);
    return {
      title: `${trip.fromCity} → ${trip.toCity} — Safaar`,
    };
  } catch {
    return {};
  }
}

export default async function BusTripPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const dict = await getDictionary(locale, "busDetail");

  // 404 → notFound(); boshqa xato → null (xato holati ko'rsatiladi).
  const trip = await getBusTrip(locale, id).catch((error: unknown) => {
    if (error instanceof ApiRequestError && error.statusCode === 404) {
      notFound();
    }
    return null;
  });

  if (!trip) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {dict.error}
        </p>
      </main>
    );
  }

  const seats = await getBusSeats(id).catch(() => []);
  const reviews = await getBusCompanyReviews(trip.companyId).catch(() => []);
  const reviewsDict = await getDictionary(locale, "reviews");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
      <div>
        <Link
          href={`/${locale}/buses`}
          className="text-sm text-primary-600 transition-colors hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          ← {dict.back}
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
          <span>{trip.fromCity}</span>
          <span aria-hidden className="text-slate-400">
            →
          </span>
          <span>{trip.toCity}</span>
        </h1>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div className="flex flex-col">
            <dt className="text-slate-500">{dict.departure}</dt>
            <dd className="font-medium">
              {formatTime(trip.departureAt, locale)}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-slate-500">{dict.arrival}</dt>
            <dd className="font-medium">
              {formatTime(trip.arrivalAt, locale)}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-slate-500">{dict.duration}</dt>
            <dd className="font-medium">
              {formatDuration(trip.durationMinutes, {
                hour: dict.hour,
                minute: dict.minute,
              })}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-slate-500">{dict.company}</dt>
            <dd className="font-medium">{trip.companyName || "—"}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-slate-500">{dict.vehicle}</dt>
            <dd className="font-medium">{trip.vehicleName || "—"}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-slate-500">{dict.availableSeats}</dt>
            <dd className="font-medium">{trip.availableSeats}</dd>
          </div>
        </dl>
      </header>

      <SeatPicker locale={locale} tripId={trip.id} seats={seats} dict={dict} />

      <ReviewsList reviews={reviews} dict={reviewsDict} locale={locale} />
    </main>
  );
}
