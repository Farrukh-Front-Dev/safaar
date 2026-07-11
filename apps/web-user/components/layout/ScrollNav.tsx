"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PillNav, type PillNavItem } from "@/components/ui/PillNav";
import ShinyText from "@/components/ui/ShinyText";

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
    exact: item.exact,
  }));

  return (
    <>
      {/* ═══ Mobil top bar (<md) ═══ */}
      <header className="sticky top-0 z-100 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link
          href={brandHref}
          className="text-base font-bold tracking-tight"
        >
          <ShinyText
            text={brand}
            speed={4}
            color="#0f766e"
            shineColor="#5eead4"
            className="text-base font-bold"
          />
        </Link>
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      {/* ═══ Desktop navbar (md+) ═══ */}
      <nav
        className="sticky top-0 z-100 hidden border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-card md:block"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href={brandHref}
            className="shrink-0 text-lg font-bold tracking-tight"
          >
            <ShinyText
              text={brand}
              speed={4}
              color="#0f766e"
              shineColor="#5eead4"
              className="text-lg font-bold"
            />
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
        className="fixed inset-x-0 bottom-0 z-100 rounded-t-2xl border border-slate-200 border-b-0 bg-white shadow-btn md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <ul className="flex items-center justify-around px-1 py-1">
          {(mobileItems ?? items).map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-all duration-200 hover:bg-slate-50 active:bg-slate-100 active:scale-[0.97] ${
                    isActive
                      ? "text-primary-700"
                      : "text-slate-400 hover:text-primary-600"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-100 hover:text-primary-600 active:bg-slate-200"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={isActive ? "font-semibold" : ""}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobil bottom bar uchun spacer (safe-area hisobga olingan) */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:hidden" />
    </>
  );
}
