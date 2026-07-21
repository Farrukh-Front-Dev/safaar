"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelsDict } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Filter, ChevronDown, RotateCcw } from "lucide-react";

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
    params.delete("page");
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
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>{dict.filters.toggle}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform text-slate-600", open && "rotate-180")} />
      </button>

      {/* Main Filter Container */}
      <div
        className={cn(
          "flex-col gap-4.5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm",
          open ? "flex" : "hidden",
          "lg:flex",
        )}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Filter className="h-4 w-4 text-blue-600" />
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
            {dict.filters.title}
          </h2>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            {dict.filters.stars}
          </span>
          <Select
            value={stars}
            onChange={setStars}
            options={[
              { value: "", label: dict.filters.anyStars },
              ...[5, 4, 3, 2, 1].map((s) => ({
                value: String(s),
                label: dict.filters.starsValue.replace("{n}", String(s)),
              })),
            ]}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
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

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            {dict.filters.priceMax} ({dict.filters.currency})
          </span>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Maksimal narx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </label>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={apply}
            className="flex-1 rounded-xl bg-blue-600 font-bold text-white shadow-xs hover:bg-blue-700"
          >
            {dict.filters.apply}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={reset}
            className="rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{dict.filters.reset}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
