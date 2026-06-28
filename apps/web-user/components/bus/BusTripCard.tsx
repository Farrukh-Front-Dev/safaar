import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { formatTime, formatDuration } from "@/lib/datetime";
import { Card } from "@/components/ui/Card";
import type { BusTripView } from "@/types/view";

export interface BusTripCardLabels {
  from: string;
  perSeat: string;
  seatsLeft: string;
  soldOut: string;
  select: string;
  hour: string;
  minute: string;
}

/**
 * Avtobus reysi kartasi — qidiruv natijalarida ishlatiladi. Presentational:
 * ma'lumot + label'larni props orqali oladi.
 */
export function BusTripCard({
  trip,
  locale,
  labels,
}: {
  trip: BusTripView;
  locale: Locale;
  labels: BusTripCardLabels;
}) {
  const soldOut = trip.availableSeats <= 0;

  return (
    <Card className="p-5">
      <article className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>{formatTime(trip.departureAt, locale)}</span>
            <span aria-hidden className="text-slate-400">
              →
            </span>
            <span>{formatTime(trip.arrivalAt, locale)}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {trip.fromCity} → {trip.toCity}
          </p>
          <p className="text-xs text-slate-500">
            {trip.companyName}
            {trip.vehicleName ? ` · ${trip.vehicleName}` : ""}
            {trip.durationMinutes > 0
              ? ` · ${formatDuration(trip.durationMinutes, labels)}`
              : ""}
            {trip.rating > 0 ? ` · ★ ${trip.rating.toFixed(1)}` : ""}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="font-semibold">
              {labels.from} {formatSum(trip.minPriceSum)}
            </p>
            <p className="text-xs text-slate-400">
              {soldOut
                ? labels.soldOut
                : `${trip.availableSeats} ${labels.seatsLeft}`}
            </p>
          </div>
          {soldOut ? (
            <span className="text-sm text-slate-400">{labels.soldOut}</span>
          ) : (
            <Link
              href={`/${locale}/buses/${trip.id}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {labels.select}
            </Link>
          )}
        </div>
      </article>
    </Card>
  );
}
