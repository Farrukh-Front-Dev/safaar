"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";
import { DatePicker } from "./DatePicker";

type PropertyType = "all" | "hotel" | "dacha" | "guesthouse" | "sanatorium" | "resort";

export interface SearchDefaults {
  cityId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

const PT_TYPES: PropertyType[] = ["all", "hotel", "dacha", "guesthouse", "sanatorium", "resort"];

const PT_ICONS: Record<PropertyType, string> = {
  all: "⊞",
  hotel: "🏨",
  dacha: "🏡",
  guesthouse: "🛖",
  sanatorium: "🏥",
  resort: "⛰️",
};

export function SearchBar({
  locale,
  dict,
  cities,
  defaults,
  propertyTypeLabels,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  defaults?: SearchDefaults;
  propertyTypeLabels?: Record<PropertyType, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cityId, setCityId] = useState(defaults?.cityId ?? "");
  const [checkIn, setCheckIn] = useState(defaults?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(defaults?.checkOut ?? "");
  const [guests, setGuests] = useState(defaults?.guests ?? 2);

  const activeType = (searchParams.get("type") as PropertyType) || "all";

  function onTypeChange(type: PropertyType) {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (cityId) params.set("city_id", cityId);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", String(guests));
    if (activeType !== "all") params.set("type", activeType);
    const query = params.toString();
    router.push(`/${locale}/hotels${query ? `?${query}` : ""}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 pt-14">
      {/* Tabs - absolute kartadan yuqorida */}
      {propertyTypeLabels && (
        <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-md shadow-slate-200/60">
          {PT_TYPES.map((type) => {
            const isActive = activeType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange(type)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 max-md:px-3 max-md:py-1.5 max-md:text-xs ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base leading-none max-md:text-xs">{PT_ICONS[type]}</span>
                <span>{propertyTypeLabels[type]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Desktop karta ═══ */}
      <form
        onSubmit={handleSubmit}
        className="hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 transition-shadow duration-300 hover:shadow-2xl hover:shadow-slate-200/80 md:block"
      >
        {/* Destination */}
        <div className="border-b border-slate-100 px-5">
          <div className="flex items-center gap-3 py-4">
            <span className="shrink-0 text-slate-400">
              <SearchIcon />
            </span>
            <div className="flex-1">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {dict.city}
              </span>
              <CityPicker
                cities={cities}
                value={cityId}
                onChange={setCityId}
                placeholder={dict.cityPlaceholder}
              />
            </div>
          </div>
        </div>

        {/* Date + Guests */}
        <div className="flex items-stretch divide-x divide-slate-100 px-5">
          <div className="flex flex-1 items-center gap-3 py-4">
            <span className="shrink-0 text-slate-400">
              <CalendarIcon />
            </span>
            <div className="flex flex-1 items-center">
              <div className="flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {dict.checkIn}
                </span>
                <DatePicker
                  locale={locale}
                  label=""
                  value={checkIn}
                  min={today}
                  icon={null}
                  compact
                  onChange={(iso) => {
                    setCheckIn(iso);
                    if (checkOut && iso > checkOut) setCheckOut("");
                  }}
                />
              </div>
              <div className="mx-4 h-8 w-px bg-slate-200" />
              <div className="flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {dict.checkOut}
                </span>
                <DatePicker
                  locale={locale}
                  label=""
                  value={checkOut}
                  min={checkIn || today}
                  icon={null}
                  compact
                  onChange={setCheckOut}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-5 pr-3 py-4">
            <span className="shrink-0 text-slate-400">
              <GuestsIcon />
            </span>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {dict.guests}
              </span>
              <GuestPicker value={guests} onChange={setGuests} />
            </div>
          </div>
        </div>

        {/* Search tugma - absolute pastda */}
        <div className="relative flex h-0 justify-center">
          <button
            type="submit"
            className="absolute -top-6 inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-10 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-[0.97]"
          >
            <SearchIconWhite />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* ═══ Mobile karta ═══ */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white shadow-xl shadow-slate-200/70 md:hidden"
      >
        <div className="border-b border-slate-100 px-4">
          <MobileCityPicker
            cities={cities}
            value={cityId}
            onChange={setCityId}
            placeholder={dict.cityPlaceholder}
          />
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 px-4">
          <div className="py-3 pr-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {dict.checkIn}
            </span>
            <DatePicker
              locale={locale}
              label=""
              value={checkIn}
              min={today}
              icon={null}
              compact
              onChange={(iso) => {
                setCheckIn(iso);
                if (checkOut && iso > checkOut) setCheckOut("");
              }}
            />
          </div>
          <div className="py-3 pl-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {dict.checkOut}
            </span>
            <DatePicker
              locale={locale}
              label=""
              value={checkOut}
              min={checkIn || today}
              icon={null}
              compact
              onChange={setCheckOut}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              <GuestsIcon />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {dict.guests}
              </span>
              <GuestPicker value={guests} onChange={setGuests} />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-200 transition-all duration-200 active:scale-[0.97]"
          >
            <SearchIconWhite />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Spacer for the overhanging button */}
      <div className="h-8 hidden md:block" />
    </div>
  );
}

/* ── Icons ── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIconWhite() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GuestsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ── City Picker Desktop ── */
function CityPicker({
  cities,
  value,
  onChange,
  placeholder,
}: {
  cities: CityOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
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
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
      >
        <p className={`text-sm font-medium ${selected ? "text-slate-900" : "text-slate-400"}`}>
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
              onClick={() => { onChange(city.id); setOpen(false); }}
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

/* ── Mobile City Picker ── */
function MobileCityPicker({
  cities,
  value,
  onChange,
  placeholder,
}: {
  cities: CityOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
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
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 py-3.5 text-left"
      >
        <span className="text-slate-400">
          <SearchIcon />
        </span>
        <span className="flex-1">
          <p className={`truncate text-sm font-medium ${selected ? "text-slate-900" : "text-slate-400"}`}>
            {selected ? selected.name : placeholder}
          </p>
        </span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => { onChange(city.id); setOpen(false); }}
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

/* ── Guest Picker ── */
function GuestPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-slate-400 transition-all duration-150 hover:border-blue-300 hover:text-blue-600 active:scale-90 disabled:opacity-30"
      >
        <MinusIcon />
      </button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={value >= 20}
        className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-slate-400 transition-all duration-150 hover:border-blue-300 hover:text-blue-600 active:scale-90 disabled:opacity-30"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
