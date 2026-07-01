import { Building2, MapPin, Star, Headphones } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";

/**
 * Ishonch qatori — raqamlar + to'lov logolari.
 * Mobile-first: mobilda vertical stack, desktop'da horizontal.
 */
export function TrustBar({ dict }: { dict: HomeDict["trust"] }) {
  const stats = [
    { icon: <Building2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden />, value: dict.hotels, label: dict.hotelsLabel },
    { icon: <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden />, value: dict.cities, label: dict.citiesLabel },
    { icon: <Star className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden />, value: dict.rating, label: dict.ratingLabel },
    { icon: <Headphones className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden />, value: dict.support, label: dict.supportLabel },
  ];

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Statistika — mobilda 2x2 grid, desktop'da row */}
        <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-8 md:gap-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-white/80">{stat.icon}</span>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white sm:text-lg">
                  {stat.value}
                </span>
                <span className="text-[10px] text-white/60 sm:text-xs">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* To'lov logolari */}
        <div className="flex items-center gap-2 sm:gap-3">
          {["Payme", "Click", "Uzcard", "Humo"].map((name) => (
            <span
              key={name}
              className="rounded border border-white/25 bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/80 sm:rounded-md sm:px-2.5 sm:py-1 sm:text-[10px]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
