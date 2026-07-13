"use client";

import { useState } from "react";
import { Hotel, Bus } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";
import { SearchBar, type SearchDefaults } from "./SearchBar";
import { BusSearchMini, type BusSearchMiniDefaults } from "./BusSearchMini";

type Tab = "hotels" | "buses";

/**
 * Qidiruv tablari — Mehmonxona / Avtobus.
 * Agoda'dagi kabi bitta blokda ikki xil qidiruvni almashtirish.
 */
export function SearchTabs({
  locale,
  dict,
  cities,
  hotelDefaults,
  busDefaults,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  hotelDefaults?: SearchDefaults;
  busDefaults?: BusSearchMiniDefaults;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("hotels");

  return (
    <div className="flex flex-col gap-3">
      {/* Tab tugmalari */}
      <div className="flex items-center gap-1 rounded-2xl bg-slate-100/80 p-1.5 backdrop-blur-sm sm:mx-auto sm:w-fit">
        <TabButton
          active={activeTab === "hotels"}
          onClick={() => setActiveTab("hotels")}
          icon={<Hotel className="h-4 w-4" aria-hidden />}
          label={dict.hotelsTab}
        />
        <TabButton
          active={activeTab === "buses"}
          onClick={() => setActiveTab("buses")}
          icon={<Bus className="h-4 w-4" aria-hidden />}
          label={dict.busesTab}
        />
      </div>

      {/* Tab kontenti */}
      {activeTab === "hotels" ? (
        <SearchBar locale={locale} dict={dict} cities={cities} defaults={hotelDefaults} />
      ) : (
        <BusSearchMini locale={locale} dict={dict} cities={cities} defaults={busDefaults} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] sm:flex-initial sm:rounded-full sm:px-5 sm:py-2 ${
        active
          ? "bg-primary-600 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
