"use client";

import { useState } from "react";
import { Hotel, Bus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";
import { SearchBar, type SearchDefaults, type PropertyType } from "./SearchBar";
import { BusSearchMini, type BusSearchMiniDefaults } from "./BusSearchMini";

type Tab = "hotels" | "buses";

const TABS: { key: Tab; icon: React.ReactNode }[] = [
  { key: "hotels", icon: <Hotel className="h-4 w-4" aria-hidden /> },
  { key: "buses", icon: <Bus className="h-4 w-4" aria-hidden /> },
];

/**
 * Qidiruv tablari — Mehmonxona / Avtobus.
 * Desktop: ikkala tab yonma-yon pill'lar.
 * Mobil: slider — strelka bilan almashtiriladi.
 */
export function SearchTabs({
  locale,
  dict,
  cities,
  hotelDefaults,
  busDefaults,
  propertyTypeLabels,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  hotelDefaults?: SearchDefaults;
  busDefaults?: BusSearchMiniDefaults;
  propertyTypeLabels?: Record<PropertyType, string>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("hotels");

  function next() {
    setActiveTab((t) => (t === "hotels" ? "buses" : "hotels"));
  }

  function prev() {
    setActiveTab((t) => (t === "hotels" ? "buses" : "hotels"));
  }

  const tabLabel = activeTab === "hotels" ? dict.hotelsTab : dict.busesTab;
  const tabIcon = activeTab === "hotels" ? <Hotel className="h-4 w-4" aria-hidden /> : <Bus className="h-4 w-4" aria-hidden />;

  return (
    <div className="flex flex-col gap-3">
      {/* ═══ Desktop: pill'lar ═══ */}
      <div className="hidden items-center gap-1 rounded-2xl bg-slate-100/80 p-1.5 backdrop-blur-sm sm:mx-auto sm:flex sm:w-fit">
        {TABS.map(({ key, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === key
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {icon}
              <span>{key === "hotels" ? dict.hotelsTab : dict.busesTab}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ═══ Mobil: slider ═══ */}
      <div className="flex items-center justify-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={prev}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-90"
          aria-label="Oldingi"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm">
          {tabIcon}
          <span>{tabLabel}</span>
        </div>

        <button
          type="button"
          onClick={next}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-90"
          aria-label="Keyingi"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Tab kontenti */}
      {activeTab === "hotels" ? (
        <SearchBar locale={locale} dict={dict} cities={cities} defaults={hotelDefaults} propertyTypeLabels={propertyTypeLabels} />
      ) : (
        <BusSearchMini locale={locale} dict={dict} cities={cities} defaults={busDefaults} />
      )}
    </div>
  );
}
