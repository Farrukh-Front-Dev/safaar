"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelsDict } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/**
 * Filtr va saralash paneli (client). URL searchParams'ni yangilaydi — natija
 * serverda shu query asosida qayta olinadi. Boshqa parametrlar (city_id, sana,
 * guests) saqlanadi.
 */
export function HotelFilters({
  dict,
}: {
  dict: Pick<HotelsDict, "filters" | "sort">;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [stars, setStars] = useState(searchParams.get("stars") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "");

  function setOrDelete(params: URLSearchParams, key: string, value: string) {
    if (value) params.set(key, value);
    else params.delete(key);
  }

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    setOrDelete(params, "stars", stars);
    setOrDelete(params, "min_price", minPrice);
    setOrDelete(params, "max_price", maxPrice);
    setOrDelete(params, "sort", sort);
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["stars", "min_price", "max_price", "sort"]) {
      params.delete(key);
    }
    setStars("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  return (
    <aside
      aria-label={dict.filters.title}
      className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
    >
      <h2 className="text-base font-semibold">{dict.filters.title}</h2>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {dict.sort.label}
        </span>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">—</option>
          <option value="price_asc">{dict.sort.priceAsc}</option>
          <option value="price_desc">{dict.sort.priceDesc}</option>
          <option value="rating">{dict.sort.rating}</option>
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {dict.filters.stars}
        </span>
        <Select value={stars} onChange={(e) => setStars(e.target.value)}>
          <option value="">{dict.filters.anyStars}</option>
          {[5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={s}>
              {"★".repeat(s)}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {dict.filters.priceMin}
        </span>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {dict.filters.priceMax}
        </span>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </label>

      <div className="flex gap-2">
        <Button type="button" onClick={apply} className="flex-1">
          {dict.filters.apply}
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          {dict.filters.reset}
        </Button>
      </div>
    </aside>
  );
}
