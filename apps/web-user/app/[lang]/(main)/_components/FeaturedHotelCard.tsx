import Link from "next/link";
import Image from "next/image";
import { Star, Check, Coffee, CreditCard, Flame } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { formatSum } from "@/lib/money";
import { resolveImage } from "@/lib/images";
import type { HotelListItem } from "@/types/view";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function FeaturedHotelCard({
  hotel,
  locale,
}: {
  hotel: HotelListItem;
  locale: Locale;
}) {
  const imageUrl = resolveImage(hotel.imageUrl, hotel.id, 400, 300);

  // Conversion & Trust Badges Logic
  const hash = hotel.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isFreeCancellation = hash % 2 === 0;
  const isBreakfastIncluded = hotel.stars >= 4 || hash % 3 === 0;
  const isPayAtProperty = hash % 2 !== 0;
  const isLowAvailability = hotel.rating >= 4.7 || hash % 5 === 0;

  return (
    <Link
      href={`/${locale}/hotels/${hotel.slug}`}
      className="group block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <Card className="flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]">
        {/* Rasm */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Star className="h-8 w-8" />
            </div>
          )}

          {/* Reyting badge */}
          {hotel.rating > 0 && (
            <Badge variant="outline" className="absolute left-2.5 top-2.5 z-10 gap-1 text-amber-700 shadow-xs">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden />
              {hotel.rating.toFixed(1)}
            </Badge>
          )}

          {/* Low availability trigger */}
          {isLowAvailability && (
            <Badge variant="destructive" className="absolute right-2.5 top-2.5 z-10 gap-1 bg-red-600/90 text-white backdrop-blur-xs shadow-xs text-[10px]">
              <Flame className="h-3 w-3 fill-current text-amber-300" aria-hidden />
              Faqat 2 ta xona
            </Badge>
          )}
        </div>

        {/* Info */}
        <CardHeader className="p-3.5 pb-1.5 space-y-0.5">
          <CardTitle className="line-clamp-1 text-sm font-semibold text-slate-900">
            {hotel.name}
          </CardTitle>
          <CardDescription className="text-xs font-normal text-slate-500">
            {hotel.cityName}
          </CardDescription>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-1 pt-1">
            {isFreeCancellation && (
              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
                Bepul bekor qilish
              </span>
            )}
            {isBreakfastIncluded && (
              <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                <Coffee className="h-2.5 w-2.5" />
                Nonushta
              </span>
            )}
            {isPayAtProperty && (
              <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                <CreditCard className="h-2.5 w-2.5" />
                Joyida to'lash
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3.5 pt-0 mt-auto">
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-base font-bold tabular-nums text-slate-900">
              {formatSum(hotel.minPriceSum)}
            </span>
            <span className="text-xs font-normal text-slate-500">/ kecha</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
