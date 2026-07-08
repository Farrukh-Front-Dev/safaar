"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";
import { DatePicker } from "./DatePicker";

export interface SearchDefaults {
  cityId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/**
 * Qidiruv bloki — bosh sahifa va natijalar sahifasida ishlatiladi.
 * Desktop: Airbnb pill (gorizontal). Mobil: birlashgan karta (stacked maydonlar).
 */
export function SearchBar({
  locale,
  dict,
  cities,
  defaults,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  defaults?: SearchDefaults;
}) {
  const router = useRouter();
  const [cityId, setCityId] = useState(defaults?.cityId ?? "");
  const [checkIn, setCheckIn] = useState(defaults?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(defaults?.checkOut ?? "");
  const [guests, setGuests] = useState(defaults?.guests ?? 2);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (cityId) params.set("city_id", cityId);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", String(guests));
    const query = params.toString();
    router.push(`/${locale}/hotels${query ? `?${query}` : ""}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2 md:rounded-full md:border md:border-white/60 md:bg-white md:p-1.5 md:shadow-[0_2px_4px_rgba(0,0,0,0.7),0_5px_12px_-2px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.5)]"
    >
      {/* ═══ Mobil: birlashgan karta ═══ */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:hidden">
        {/* Shahar */}
        <MobileCityPicker
          cities={cities}
          value={cityId}
          onChange={setCityId}
          label={dict.city}
          placeholder={dict.cityPlaceholder}
        />

        {/* Sanalar — 2 ta yon-yoniga */}
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div className="p-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-400">
                {dict.checkIn}
              </span>
              <DatePicker
                locale={locale}
                label={dict.checkIn}
                value={checkIn}
                min={today}
                icon={<CalendarIcon />}
                onChange={(iso) => {
                  setCheckIn(iso);
                  if (checkOut && iso > checkOut) setCheckOut("");
                }}
                compact
              />
            </label>
          </div>
          <div className="p-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-400">
                {dict.checkOut}
              </span>
              <DatePicker
                locale={locale}
                label={dict.checkOut}
                value={checkOut}
                min={checkIn || today}
                icon={<CalendarIcon />}
                onChange={setCheckOut}
                compact
              />
            </label>
          </div>
        </div>

        {/* Mehmonlar */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              <GuestsIcon />
            </span>
            <span className="text-sm font-medium text-slate-700">
              {dict.guests}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              aria-label="-"
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 active:scale-90 disabled:opacity-40"
              disabled={guests <= 1}
            >
              <MinusIcon />
            </button>
            <span className="w-5 text-center text-sm font-bold tabular-nums text-slate-900">
              {guests}
            </span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(20, g + 1))}
              aria-label="+"
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 active:scale-90 disabled:opacity-40"
              disabled={guests >= 20}
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Mobil: Qidirish tugmasi — to'liq kenglik */}
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.4)] transition-all duration-150 hover:bg-primary-500 active:scale-[0.98] md:hidden"
      >
        <SearchIcon />
        <span>{dict.submit}</span>
      </button>

      {/* ═══ Desktop: Airbnb pill (md+) ═══ */}
      <div className="hidden md:contents">
        {/* Shahar */}
        <CityPicker
          cities={cities}
          value={cityId}
          onChange={setCityId}
          label={dict.city}
          placeholder={dict.cityPlaceholder}
        />

        {/* Kirish sanasi */}
        <DatePicker
          locale={locale}
          label={dict.checkIn}
          value={checkIn}
          min={today}
          icon={<CalendarIcon />}
          onChange={(iso) => {
            setCheckIn(iso);
            if (checkOut && iso > checkOut) setCheckOut("");
          }}
        />

        {/* Chiqish sanasi */}
        <DatePicker
          locale={locale}
          label={dict.checkOut}
          value={checkOut}
          min={checkIn || today}
          icon={<CalendarIcon />}
          onChange={setCheckOut}
        />

        {/* Mehmonlar */}
        <Field icon={<GuestsIcon />} label={dict.guests}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              aria-label="-"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 active:scale-90 disabled:opacity-40"
              disabled={guests <= 1}
            >
              <MinusIcon />
            </button>
            <span className="w-5 text-center text-sm font-semibold tabular-nums text-slate-900">
              {guests}
            </span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(20, g + 1))}
              aria-label="+"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 active:scale-90 disabled:opacity-40"
              disabled={guests >= 20}
            >
              <PlusIcon />
            </button>
          </div>
        </Field>

        {/* Qidirish tugmasi */}
        <button
          type="submit"
          className="group inline-flex h-auto flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-7 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-primary-500 active:scale-95"
        >
          <SearchIcon />
          <span>{dict.submit}</span>
        </button>
      </div>
    </form>
  );
}

/* ── Mobil shahar tanlash (birlashgan karta ichida) ── */
function MobileCityPicker({
  cities,
  value,
  onChange,
  label,
  placeholder,
}: {
  cities: CityOption[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = cities.find((c) => c.id === value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="text-slate-400">
          <PinIcon />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[11px] font-medium text-slate-400">{label}</span>
          <span
            className={`truncate text-sm font-medium ${
              selected ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {selected ? selected.name : placeholder}
          </span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {cities.length === 0 && (
              <span className="px-2 py-1 text-sm text-slate-400">—</span>
            )}
            {cities.map((city) => {
              const active = city.id === value;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    onChange(city.id);
                    setOpen(false);
                  }}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-95 ${
                    active
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Desktop: Maydon konteyneri ── */
function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="group flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2.5 transition-all hover:border-primary-300 hover:bg-slate-50"
      style={{
        boxShadow:
          "0 0 3px rgba(0,0,0,0.7), 0 0 6px -1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
    >
      <span className="shrink-0 text-slate-400 transition-colors group-hover:text-primary-600">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
        {children}
      </div>
    </div>
  );
}

/* ── Desktop shahar tanlash ── */
function CityPicker({
  cities,
  value,
  onChange,
  label,
  placeholder,
}: {
  cities: CityOption[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = cities.find((c) => c.id === value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group flex w-full items-center gap-3 rounded-full border border-slate-200 px-4 py-2.5 text-left transition-all hover:border-primary-300 hover:bg-slate-50"
        style={{
          boxShadow:
            "0 0 3px rgba(0,0,0,0.7), 0 0 6px -1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <span className="shrink-0 text-slate-400 transition-colors group-hover:text-primary-600">
          <PinIcon />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[11px] font-medium text-slate-400">{label}</span>
          <span
            className={`truncate text-sm font-medium ${
              selected ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {selected ? selected.name : placeholder}
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex flex-wrap gap-2">
            {cities.length === 0 && (
              <span className="px-2 py-1 text-sm text-slate-400">—</span>
            )}
            {cities.map((city) => {
              const active = city.id === value;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    onChange(city.id);
                    setOpen(false);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                    active
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Ikonlar ── */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path
        d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GuestsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
