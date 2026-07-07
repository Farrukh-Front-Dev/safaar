"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PillNav, type PillNavItem } from "@/components/ui/PillNav";

export type ScrollNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

/**
 * Sayt navbari.
 * Desktop (md+): markazlashtirilgan oq pill — logo | PillNav | actions.
 * Mobil (<md): pastda fixed bottom tab bar — ikonka + label.
 *
 * Ranglar:
 * - Navbar fon: solid oq, border-slate-200, yengil shadow.
 * - PillNav: to'q slate pill'lar, hover'da emerald to'ldiradi, matn oqqa o'tadi.
 * - Mobil active: emerald-600 ikonka fon.
 * - Logo: emerald-700, hover'da emerald-600.
 */
export function ScrollNav({
  items,
  mobileItems,
  brand,
  brandHref,
  actions,
}: {
  items: ScrollNavItem[];
  mobileItems?: ScrollNavItem[];
  brand: string;
  brandHref: string;
  actions: React.ReactNode;
}) {
  const pathname = usePathname();

  const pillItems: PillNavItem[] = items.map((item) => ({
    label: item.label,
    href: item.href,
  }));

  return (
    <>
      {/* ═══ Desktop navbar (md+) ═══ */}
      <nav
        className="sticky top-0 z-100 hidden border-b border-slate-200 bg-white/95 backdrop-blur-sm md:block"
        style={{
          boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px -4px rgba(15,23,42,0.06)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href={brandHref}
            className="shrink-0 text-lg font-bold tracking-tight text-primary-700 transition-colors hover:text-primary-600"
          >
            {brand}
          </Link>

          {/* Nav — PillNav (gsap hover-fill) */}
          <PillNav
            items={pillItems}
            baseColor="#16a34a"
            pillColor="#f1f5f9"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#1e293b"
          />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      </nav>

      {/* ═══ Mobil bottom bar (<md) ═══ */}
      <nav
        aria-label="Mobil navigatsiya"
        className="fixed inset-x-0 bottom-0 z-100 rounded-t-2xl border border-slate-200 border-b-0 bg-white md:hidden"
        style={{
          boxShadow: "0 -1px 3px rgba(15,23,42,0.04), 0 -4px 12px -4px rgba(15,23,42,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <ul className="flex items-center justify-around py-2">
          {(mobileItems ?? items).map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-semibold transition-colors duration-200 active:scale-95 ${
                    isActive ? "text-primary-700" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobil bottom bar uchun spacer (safe-area hisobga olingan) */}
      <div className="h-[calc(4rem+env(safe-area-inset-bottom,0px))] md:hidden" />
    </>
  );
}
