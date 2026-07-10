"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { BusesDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface BusSearchDefaults {
  fromCityId?: string;
  toCityId?: string;
  date?: string;
}

/**
 * Avtobus qidiruv bloki — qaerdan / qaerga / sana. Submitda `/[lang]/buses` ga
 * query bilan navigatsiya qiladi; natijalar serverda shu query asosida olinadi.
 * SearchBar (mehmonxona) bilan bir xil pattern.
 */
export function BusSearchBar({
  locale,
  dict,
  cities,
  defaults,
}: {
  locale: Locale;
  dict: BusesDict["search"];
  cities: CityOption[];
  defaults?: BusSearchDefaults;
}) {
  const router = useRouter();
  const [fromCityId, setFromCityId] = useState(defaults?.fromCityId ?? "");
  const [toCityId, setToCityId] = useState(defaults?.toCityId ?? "");
  const [date, setDate] = useState(defaults?.date ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (fromCityId) params.set("from_city_id", fromCityId);
    if (toCityId) params.set("to_city_id", toCityId);
    if (date) params.set("date", date);
    const query = params.toString();
    router.push(`/${locale}/buses${query ? `?${query}` : ""}`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {dict.from}
          </span>
          <Select
            value={fromCityId}
            onChange={setFromCityId}
            ariaLabel={dict.from}
            options={[
              { value: "", label: dict.cityPlaceholder },
              ...cities.map((city) => ({
                value: city.id,
                label: city.name,
              })),
            ]}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {dict.to}
          </span>
          <Select
            value={toCityId}
            onChange={setToCityId}
            ariaLabel={dict.to}
            options={[
              { value: "", label: dict.cityPlaceholder },
              ...cities.map((city) => ({
                value: city.id,
                label: city.name,
              })),
            ]}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {dict.date}
          </span>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <Button type="submit">{dict.submit}</Button>
      </form>
    </div>
  );
}
