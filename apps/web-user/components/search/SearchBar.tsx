"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface SearchDefaults {
  cityId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/**
 * Qidiruv bloki — bosh sahifa va natijalar sahifasida ishlatiladi.
 * Interaktiv bo'lgani uchun client komponent. Shaharlar serverdan props orqali
 * keladi. Submitda `/[lang]/hotels` ga query bilan navigatsiya qiladi.
 */
export function SearchBar({
  locale,
  dict,
  cities,
  defaults,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  defaults?: SearchDefaults;
}) {
  const router = useRouter();
  const [cityId, setCityId] = useState(defaults?.cityId ?? "");
  const [checkIn, setCheckIn] = useState(defaults?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(defaults?.checkOut ?? "");
  const [guests, setGuests] = useState(defaults?.guests ?? 2);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (cityId) params.set("city_id", cityId);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", String(guests));
    const query = params.toString();
    router.push(`/${locale}/hotels${query ? `?${query}` : ""}`);
  }

  const labelClass = "text-sm font-medium text-slate-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div
        className="mb-4 inline-flex gap-1 rounded-full bg-slate-100 p-1"
        role="tablist"
        aria-label={dict.city}
      >
        <span
          role="tab"
          aria-selected="true"
          className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm"
        >
          {dict.hotelsTab}
        </span>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          onClick={() => router.push(`/${locale}/buses`)}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {dict.busesTab}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      >
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className={labelClass}>{dict.city}</span>
          <Select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            aria-label={dict.city}
          >
            <option value="">{dict.cityPlaceholder}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>{dict.checkIn}</span>
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>{dict.checkOut}</span>
          <Input
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1">
          <label htmlFor="search-guests" className={labelClass}>
            {dict.guests}
          </label>
          <div className="flex gap-2">
            <div className="w-20 shrink-0">
              <Input
                id="search-guests"
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                className="tabular-nums"
              />
            </div>
            <Button type="submit" className="flex-1">
              {dict.submit}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
