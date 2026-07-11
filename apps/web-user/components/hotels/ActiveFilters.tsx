"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelsDict } from "@/i18n/dictionaries";
import { formatSum } from "@/lib/money";

/**
 * Faol filtrlarni chip ko'rinishida ko'rsatadi; har biri olib tashlanadi.
 * "Filtrlarni tozalash" hammasini bekor qiladi (city/sana saqlanadi).
 */
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
          className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 shadow-btn transition-all hover:bg-primary-100 hover:border-primary-300 hover:shadow-btn-hover active:bg-primary-200 active:scale-[0.97]"
        >
          {chip.label}
          <span aria-hidden className="text-base leading-none">
            ×
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => remove(["stars", "min_price", "max_price", "sort"])}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-btn transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover active:bg-slate-100 active:scale-[0.97] active:shadow-btn-active"
      >
        {dict.clearFilters}
      </button>
    </div>
  );
}
