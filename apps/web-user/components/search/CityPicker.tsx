"use client";

import { useEffect, useRef, useState } from "react";
import type { CityOption } from "@/types/view";

interface Props {
  cities: CityOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}

export function CityPicker({ cities, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = cities.find((c) => c.id === value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
      >
        <p className={`truncate text-sm font-medium ${selected ? "text-slate-900" : "text-slate-400"}`}>
          {selected ? selected.name : placeholder}
        </p>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {cities.length === 0 && <p className="px-3 py-4 text-center text-sm text-slate-400">—</p>}
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => {
                onChange(city.id);
                setOpen(false);
              }}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                city.id === value ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
