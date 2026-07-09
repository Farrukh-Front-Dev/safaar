"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelsDict } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/**
 * Filtr paneli (client). URL searchParams'ni yangilaydi — natija serverda shu
 * query asosida qayta olinadi. Mobilda yig'iladigan (collapsible). Saralash bu
 * yerda emas — u natijalar tepasida mustaqil dropdown (`HotelSortSelect`).
 */
export function HotelFilters({ dict }: { dict: Pick<HotelsDict, "filters"> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(searchParams.get("stars") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");

  function setOrDelete(params: URLSearchParams, key: string, value: string) {
    if (value) params.set(key, value);
    else params.delete(key);
  }

  function push(params: URLSearchParams) {
    params.delete("page"); // filtr o'zgarsa — 1-sahifaga
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    setOrDelete(params, "stars", stars);
    setOrDelete(params, "min_price", minPrice);
    setOrDelete(params, "max_price", maxPrice);
    push(params);
    setOpen(false);
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["stars", "min_price", "max_price"]) params.delete(key);
    setStars("");
    setMinPrice("");
    setMaxPrice("");
    push(params);
  }

  return (
    <aside aria-label={dict.filters.title} className="lg:sticky lg:top-20 lg:h-fit">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-btn transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active lg:hidden"
      >
        {dict.filters.toggle}
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>

      <div
        className={cn(
          "flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-btn",
          open ? "flex" : "hidden",
          "lg:flex",
        )}
      >
        <h2 className="text-base font-semibold">{dict.filters.title}</h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">{dict.filters.stars}</span>
          <Select value={stars} onChange={(e) => setStars(e.target.value)}>
            <option value="">{dict.filters.anyStars}</option>
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>
                {dict.filters.starsValue.replace("{n}", String(s))}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">
            {dict.filters.priceMin} ({dict.filters.currency})
          </span>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">
            {dict.filters.priceMax} ({dict.filters.currency})
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
      </div>
    </aside>
  );
}
