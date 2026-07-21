"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import ShinyText from "@/components/ui/ShinyText";
import { cn } from "@/lib/cn";

/**
 * Til almashtirgich — ixcham bitta tugma (globus + joriy til kodi + chevron).
 * Bosilganda kichik animatsiyali menyu ochiladi; til tanlansa joriy URL
 * saqlanib faqat til segmenti almashadi: `/ru/hotels` → `/en/hotels`.
 *
 * A11y: `aria-haspopup`/`aria-expanded`, Escape va tashqariga bosishda yopiladi,
 * `aria-current` + check ikonka faol tilda, `focus-visible:ring`.
 */
export function LocaleSwitcher({ current, light }: { current: Locale; light?: boolean }) {
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
          "inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-bold uppercase tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-95",
          light
            ? open
              ? "border-primary-200 bg-primary-50 text-primary-700 shadow-xs"
              : "border-slate-300 bg-white text-slate-900 shadow-xs hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 active:scale-[0.97]"
            : open
              ? "border-white/50 bg-white/20 text-white shadow-xs"
              : "border-white/40 bg-transparent text-white/90 hover:bg-white/10 hover:border-white/60 hover:text-white",
        )}
      >
        <ShinyText
          text={current.toUpperCase()}
          speed={12}
          color={light ? "#0f172a" : "#ffffff"}
          shineColor={light ? "#2563eb" : "#7dd3fc"}
          className="text-xs font-bold uppercase tracking-wide"
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
                    {active && (
                      <Check className="h-4 w-4 text-primary-600" aria-hidden />
                    )}
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
