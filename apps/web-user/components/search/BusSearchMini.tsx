"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import type { CityOption } from "@/types/view";

export interface BusSearchMiniDefaults {
  fromCityId?: string;
  toCityId?: string;
  date?: string;
}

/**
 * Bosh sahifadagi ixcham avtobus qidiruv formasi.
 * SearchBar (mehmonxona) bilan bir xil dizayn tiliga mos.
 */
export function BusSearchMini({
  locale,
  dict,
  cities,
  defaults,
}: {
  locale: Locale;
  dict: CommonDict["search"];
  cities: CityOption[];
  defaults?: BusSearchMiniDefaults;
}) {
  const router = useRouter();
  const [fromCityId, setFromCityId] = useState(defaults?.fromCityId ?? "");
  const [toCityId, setToCityId] = useState(defaults?.toCityId ?? "");
  const [date, setDate] = useState(defaults?.date ?? "");

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (fromCityId) params.set("from_city_id", fromCityId);
    if (toCityId) params.set("to_city_id", toCityId);
    if (date) params.set("date", date);
    const query = params.toString();
    router.push(`/${locale}/buses${query ? `?${query}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0 md:rounded-full md:border md:border-white/60 md:bg-white md:p-1.5 md:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_16px_40px_-8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.04)]"
    >
      {/* ═══ Mobil: birlashgan karta ═══ */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:hidden">
        {/* Qayerdan */}
        <MobileCitySelect
          cities={cities}
          value={fromCityId}
          onChange={setFromCityId}
          label="Qayerdan"
          placeholder={dict.cityPlaceholder}
        />
        {/* Qayerga */}
        <MobileCitySelect
          cities={cities}
          value={toCityId}
          onChange={setToCityId}
          label="Qayerga"
          placeholder={dict.cityPlaceholder}
        />
        {/* Sana */}
        <div className="flex items-center gap-3 p-3">
          <span className="text-slate-400">
            <CalendarIcon />
          </span>
          <label className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[11px] font-medium text-slate-400">Sana</span>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
            />
          </label>
        </div>
      </div>

      {/* Mobil tugma */}
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.4)] transition-all duration-150 hover:bg-primary-500 active:scale-[0.98] md:hidden"
      >
        <SearchIcon />
        <span>{dict.submit}</span>
      </button>

      {/* ═══ Desktop pill ═══ */}
      <div className="hidden md:contents">
        <DesktopCitySelect
          cities={cities}
          value={fromCityId}
          onChange={setFromCityId}
          label="Qayerdan"
          placeholder={dict.cityPlaceholder}
        />

        <Divider />

        <DesktopCitySelect
          cities={cities}
          value={toCityId}
          onChange={setToCityId}
          label="Qayerga"
          placeholder={dict.cityPlaceholder}
        />

        <Divider />

        {/* Sana */}
        <div
          className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2.5 transition-all hover:border-primary-300 hover:bg-slate-50"
          style={{
            boxShadow:
              "0 1px 3px rgba(15,23,42,0.08), 0 4px 10px -2px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <span className="shrink-0 text-slate-400">
            <CalendarIcon />
          </span>
          <label className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] font-medium text-slate-400">Sana</span>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
            />
          </label>
        </div>

        {/* Qidirish */}
        <button
          type="submit"
          className="group inline-flex h-auto shrink-0 items-center justify-center gap-2 rounded-full bg-primary-600 px-7 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.1),0_8px_20px_-4px_rgba(13,148,136,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-primary-500 active:scale-95"
        >
          <SearchIcon />
          <span>{dict.submit}</span>
        </button>
      </div>
    </form>
  );
}

/* ── Mobil shahar select ── */
function MobileCitySelect({
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
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="text-slate-400"><PinIcon /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[11px] font-medium text-slate-400">{label}</span>
          <span className={`truncate text-sm font-medium ${selected ? "text-slate-900" : "text-slate-400"}`}>
            {selected ? selected.name : placeholder}
          </span>
        </span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => { onChange(city.id); setOpen(false); }}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-95 ${
                  city.id === value
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Desktop shahar select ── */
function DesktopCitySelect({
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
    <div ref={ref} className="relative flex-[1.2]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-3 rounded-full border border-slate-200 px-4 py-2.5 text-left transition-all hover:border-primary-300 hover:bg-slate-50"
        style={{
          boxShadow:
            "0 1px 3px rgba(15,23,42,0.08), 0 4px 10px -2px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <span className="shrink-0 text-slate-400 transition-colors group-hover:text-primary-600">
          <PinIcon />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[11px] font-medium text-slate-400">{label}</span>
          <span className={`truncate text-sm font-medium ${selected ? "text-slate-900" : "text-slate-400"}`}>
            {selected ? selected.name : placeholder}
          </span>
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => { onChange(city.id); setOpen(false); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                  city.id === value
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="hidden w-px self-center bg-slate-200 md:block md:h-8" />;
}

/* ── Ikonlar ── */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
