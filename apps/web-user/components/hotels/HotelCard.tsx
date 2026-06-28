import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { Card } from "@/components/ui/Card";
import type { HotelListItem } from "@/types/view";

export interface HotelCardLabels {
  perNight: string;
  reviews: string;
}

/**
 * Mehmonxona kartasi — bosh sahifa va qidiruv natijalarida qayta ishlatiladi.
 * Presentational: ma'lumot + label'larni props orqali oladi, til/dict'ga
 * bog'lanmaydi (qayta ishlatish oson bo'lsin).
 */
export function HotelCard({
  hotel,
  locale,
  labels,
}: {
  hotel: HotelListItem;
  locale: Locale;
  labels: HotelCardLabels;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link
        href={`/${locale}/hotels/${hotel.slug}`}
        className="flex h-full flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <article className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold">{hotel.name}</h3>
            <span
              className="shrink-0 text-sm text-amber-600"
              aria-label={`Reyting ${hotel.rating.toFixed(1)}`}
            >
              ★ {hotel.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-zinc-500">{hotel.cityName}</p>
          <div className="mt-auto pt-3">
            <p className="font-medium">
              {formatSum(hotel.minPriceSum)} / {labels.perNight}
            </p>
            <p className="text-xs text-zinc-400">
              {hotel.reviewsCount} {labels.reviews}
            </p>
          </div>
        </article>
      </Link>
    </Card>
  );
}
