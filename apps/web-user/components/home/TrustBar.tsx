import { Building2, MapPin, Star, Headphones } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";
import type { PublicStatsView } from "@/lib/api/cms";

/**
 * Ishonch qatori — raqamlar + to'lov logolari.
 * Oq fon, matnlar to'q. Sahifadagi boshqa bo'limlardan border bilan ajraladi.
 */
export function TrustBar({
  dict,
  stats,
}: {
  dict: HomeDict["trust"];
  stats?: PublicStatsView | null;
}) {
  // Backend'dan kelsa real raqamlar, bo'lmasa i18n statik matn.
  const statsItems = stats
    ? [
        {
          icon: <Building2 className="h-5 w-5" aria-hidden />,
          value: stats.totalHotels.toLocaleString("uz-UZ"),
          label: dict.hotelsLabel,
        },
        {
          icon: <MapPin className="h-5 w-5" aria-hidden />,
          value: stats.totalCities.toLocaleString("uz-UZ"),
          label: dict.citiesLabel,
        },
        {
          icon: <Star className="h-5 w-5" aria-hidden />,
          value: stats.averageRating.toFixed(1),
          label: dict.ratingLabel,
        },
        {
          icon: <Headphones className="h-5 w-5" aria-hidden />,
          value: dict.support,
          label: dict.supportLabel,
        },
      ]
    : [
        {
          icon: <Building2 className="h-5 w-5" aria-hidden />,
          value: dict.hotels,
          label: dict.hotelsLabel,
        },
        {
          icon: <MapPin className="h-5 w-5" aria-hidden />,
          value: dict.cities,
          label: dict.citiesLabel,
        },
        {
          icon: <Star className="h-5 w-5" aria-hidden />,
          value: dict.rating,
          label: dict.ratingLabel,
        },
        {
          icon: <Headphones className="h-5 w-5" aria-hidden />,
          value: dict.support,
          label: dict.supportLabel,
        },
      ];

  return (
    <section className="border-t border-slate-200 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
        {/* Statistika */}
        <div className="grid grid-cols-2 gap-5 sm:flex sm:flex-wrap sm:items-center sm:gap-10">
          {statsItems.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary-600 shadow-btn">
                {stat.icon}
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* To'lov logolari */}
        <div className="flex items-center gap-2.5">
          {["Payme", "Click", "Uzcard", "Humo"].map((name) => (
            <span
              key={name}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-btn"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
