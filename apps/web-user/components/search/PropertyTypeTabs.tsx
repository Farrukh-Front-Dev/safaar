"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type PropertyType = "all" | "hotel" | "dacha" | "guesthouse" | "sanatorium" | "resort";

const TYPES: PropertyType[] = ["all", "hotel", "dacha", "guesthouse", "sanatorium", "resort"];

const ICONS: Record<PropertyType, string> = {
  all: "⊞",
  hotel: "🏨",
  dacha: "🏡",
  guesthouse: "🛖",
  sanatorium: "🏥",
  resort: "⛰️",
};

export function PropertyTypeTabs({
  labels,
}: {
  labels: Record<PropertyType, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = (searchParams.get("type") as PropertyType) || "all";

  function handleClick(type: PropertyType) {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {TYPES.map((type) => {
        const isActive = active === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleClick(type)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${
              isActive
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white/80 text-slate-600 ring-1 ring-slate-200 backdrop-blur-sm hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-300"
            }`}
          >
            <span className="text-sm leading-none">{ICONS[type]}</span>
            <span>{labels[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
