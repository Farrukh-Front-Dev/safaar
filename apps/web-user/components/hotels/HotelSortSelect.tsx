"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelsDict } from "@/i18n/dictionaries";
import { Select } from "@/components/ui/Select";

/**
 * Saralash — natijalar tepasidagi mustaqil dropdown. O'zgarishi bilan darhol
 * qo'llanadi ("Qo'llash" shart emas) va sahifani 1-ga qaytaradi.
 */
export function HotelSortSelect({ dict }: { dict: HotelsDict["sort"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="whitespace-nowrap text-slate-500">{dict.label}:</span>
      <div className="w-48 sm:w-56">
        <Select
          value={current}
          onChange={(e) => onChange(e.target.value)}
          aria-label={dict.label}
        >
          <option value="">{dict.default}</option>
          <option value="price_asc">{dict.priceAsc}</option>
          <option value="price_desc">{dict.priceDesc}</option>
          <option value="rating">{dict.rating}</option>
        </Select>
      </div>
    </label>
  );
}
