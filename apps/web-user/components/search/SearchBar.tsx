"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, Users } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { CityPicker } from "./CityPicker";
import { GuestPicker } from "./GuestPicker";
import { PropertyTypeTabs } from "./PropertyTypeTabs";
import type { PropertyType, SearchDefaults } from "./types";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";

export type { PropertyType, SearchDefaults };

export function SearchBar({
  locale,
  dict,
  cities,
  defaults,
  propertyTypeLabels,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  defaults?: SearchDefaults;
  propertyTypeLabels?: Record<PropertyType, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [cityId, setCityId] = useState(defaults?.cityId ?? "");
  const [checkIn, setCheckIn] = useState(defaults?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(defaults?.checkOut ?? "");
  const [guests, setGuests] = useState(defaults?.guests ?? 2);

  const activeType = (searchParams.get("type") as PropertyType) || "hotel";
  const today = new Date().toISOString().split("T")[0];

  function onTypeChange(type: PropertyType) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (cityId) params.set("city_id", cityId);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", String(guests));
    params.set("type", activeType);
    const query = params.toString();
    router.push(`/${locale}/hotels${query ? `?${query}` : ""}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white shadow-xl shadow-slate-200/70 transition-shadow duration-300 hover:shadow-2xl hover:shadow-slate-200/80"
      >
        {/* ── Property type tabs ── */}
        {propertyTypeLabels && (
          <div className="border-b border-slate-100 px-5 py-3 max-md:px-4 max-md:py-2">
            <div className="flex justify-center overflow-x-auto scrollbar-none">
              <PropertyTypeTabs
                activeType={activeType}
                onChange={onTypeChange}
                labels={propertyTypeLabels}
              />
            </div>
          </div>
        )}

        {/* ── Destination ── */}
        <div className="border-b border-slate-100 px-5 max-md:px-4">
          <div className="flex items-center gap-3 py-4 max-md:py-3">
            <span className="shrink-0 text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {dict.city}
              </span>
              <CityPicker
                cities={cities}
                value={cityId}
                onChange={setCityId}
                placeholder={dict.cityPlaceholder}
              />
            </div>
          </div>
        </div>

        {/* ── Date + Guests (desktop: row, mobile: stacked) ── */}
        <div className="md:flex md:items-stretch md:divide-x md:divide-slate-100">
          {/* Date */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 max-md:px-4 max-md:py-3 md:flex-1 md:border-b-0">
            <span className="shrink-0 text-slate-400">
              <Calendar className="h-5 w-5 text-blue-500" />
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-3 max-md:gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {dict.checkIn}
                </span>
                <DatePicker
                  locale={locale}
                  label=""
                  value={checkIn}
                  min={today}
                  icon={null}
                  compact
                  onChange={(iso) => {
                    setCheckIn(iso);
                    if (checkOut && iso > checkOut) setCheckOut("");
                  }}
                />
              </div>
              <div className="h-6 w-px shrink-0 bg-slate-200" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {dict.checkOut}
                </span>
                <DatePicker
                  locale={locale}
                  label=""
                  value={checkOut}
                  min={checkIn || today}
                  icon={null}
                  compact
                  onChange={setCheckOut}
                />
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 max-md:px-4 max-md:py-3 md:border-b-0 md:pl-5 md:pr-3">
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-slate-400">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {dict.guests}
                </span>
                <GuestPicker value={guests} onChange={setGuests} />
              </div>
            </div>

            {/* Search — mobile: inline, desktop: overhanging ↓ */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 active:scale-[0.97] md:hidden"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Desktop search button — overhanging */}
        <div className="relative hidden h-0 justify-center md:flex">
          <button
            type="submit"
            className="absolute -top-6 inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-10 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-[0.97]"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      <div className="h-8 max-md:hidden" />
    </div>
  );
}
