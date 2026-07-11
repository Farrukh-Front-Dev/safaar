"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type ScrollNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

interface Props {
  items: ScrollNavItem[];
  mobileItems: ScrollNavItem[];
  brand: string;
  brandHref: string;
  actions: React.ReactNode;
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function ScrollNav({ items, mobileItems, brand, brandHref, actions }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* ═══ Mobile header (top bar) ═══ */}
      <header className="sticky top-0 z-100 flex h-12 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md md:hidden">
        <Link href={brandHref} className="text-base font-bold tracking-tight text-slate-800">
          {brand}
        </Link>
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      {/* ═══ Desktop navbar ═══ */}
      <nav className="sticky top-0 z-100 hidden border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md md:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link
            href={brandHref}
            className="shrink-0 text-lg font-bold tracking-tight text-slate-800"
          >
            {brand}
          </Link>

          <div className="flex items-center gap-0.5">
            {items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      </nav>

      {/* ═══ Mobile bottom bar ═══ */}
      <nav
        aria-label="Mobil navigatsiya"
        className="fixed inset-x-0 bottom-0 z-100 rounded-t-2xl border border-slate-200 border-b-0 bg-white shadow-btn md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="flex items-center justify-around px-1 py-1">
          {mobileItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-all duration-200 hover:bg-slate-50 active:bg-slate-100 active:scale-[0.97]",
                    active ? "text-primary-700" : "text-slate-400 hover:text-primary-600",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                      active
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-100 hover:text-primary-600 active:bg-slate-200",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className={active ? "font-semibold" : ""}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Spacer for mobile bottom bar */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:hidden" />
    </>
  );
}
