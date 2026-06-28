"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * Til almashtirgich. Joriy URL'ni saqlab, faqat birinchi segment (til)ni
 * almashtiradi: `/ru/hotels` → `/en/hotels`.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();

  function localizedHref(locale: Locale): string {
    const segments = pathname.split("/");
    // segments[0] = "" (boshlang'ich "/"), segments[1] = joriy til
    if (segments.length > 1) {
      segments[1] = locale;
    }
    const next = segments.join("/");
    return next || `/${locale}`;
  }

  return (
    <nav aria-label="Til tanlash" className="flex items-center gap-1">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={localizedHref(locale)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md px-2 py-1 text-sm uppercase transition-colors",
              active
                ? "bg-blue-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
