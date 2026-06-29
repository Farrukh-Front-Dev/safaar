"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * Til almashtirgich — ixcham bitta tugma (globus + joriy til kodi + chevron).
 * Bosilganda kichik animatsiyali menyu ochiladi; til tanlansa joriy URL
 * saqlanib faqat til segmenti almashadi: `/ru/hotels` → `/en/hotels`.
 *
 * A11y: `aria-haspopup`/`aria-expanded`, Escape va tashqariga bosishda yopiladi,
 * `aria-current` + check ikonka faol tilda, `focus-visible:ring`.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function localizedHref(locale: Locale): string {
    const segments = pathname.split("/");
    // segments[0] = "" (boshlang'ich "/"), segments[1] = joriy til
    if (segments.length > 1) {
      segments[1] = locale;
    }
    return segments.join("/") || `/${locale}`;
  }

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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Til tanlash"
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          open
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : "border-slate-200 text-slate-700 hover:bg-slate-100",
        )}
      >
        <GlobeIcon />
        <span className="uppercase">{current}</span>
        <ChevronIcon
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label="Til tanlash"
          className="absolute right-0 z-50 mt-2 min-w-44 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150"
        >
          {locales.map((locale) => {
            const active = locale === current;
            return (
              <li key={locale} role="none">
                <Link
                  role="menuitem"
                  href={localizedHref(locale)}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <span className="flex w-4 shrink-0 justify-center">
                    {active && <CheckIcon />}
                  </span>
                  <span className="flex-1">{localeNames[locale]}</span>
                  <span
                    className={cn(
                      "text-xs uppercase",
                      active ? "text-primary-500" : "text-slate-400",
                    )}
                  >
                    {locale}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 text-primary-600"
      aria-hidden
    >
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
