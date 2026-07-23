"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelsDict } from "@/i18n/dictionaries";
import { formatSum } from "@/lib/money";
import { X } from "lucide-react";

export function ActiveFilters({ dict }: { dict: HotelsDict }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function remove(keys: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((k) => params.delete(k));
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  const stars = searchParams.get("stars");
  const min = searchParams.get("min_price");
  const max = searchParams.get("max_price");
  const sort = searchParams.get("sort");
  const sortLabels: Record<string, string> = {
    price_asc: dict.sort.priceAsc,
    price_desc: dict.sort.priceDesc,
    rating: dict.sort.rating,
  };

  const chips: Array<{ key: string; label: string }> = [];
  if (stars) {
    chips.push({
      key: "stars",
      label: dict.filters.starsValue.replace("{n}", stars),
    });
  }
  if (min && Number.isFinite(Number(min))) {
    chips.push({
      key: "min_price",
      label: `${dict.filters.priceMin}: ${formatSum(Number(min))}`,
    });
  }
  if (max && Number.isFinite(Number(max))) {
    chips.push({
      key: "max_price",
      label: `${dict.filters.priceMax}: ${formatSum(Number(max))}`,
    });
  }
  if (sort && sortLabels[sort]) {
    chips.push({ key: "sort", label: sortLabels[sort] });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => remove([chip.key])}
          aria-label={`${dict.removeFilter}: ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-950 shadow-2xs transition-all hover:bg-blue-100 hover:border-blue-400 active:scale-[0.97]"
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5 stroke-[2.5] text-blue-700" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={() => remove(["stars", "min_price", "max_price", "sort"])}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.97]"
      >
        {dict.clearFilters}
      </button>
    </div>
  );
}
