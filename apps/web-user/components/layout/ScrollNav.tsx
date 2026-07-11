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
 * Desktop (md+): markazlashtirilgan pill — logo | PillNav | actions.
 * Mobil (<md): pastda fixed bottom tab bar — ikonka + label.
 *
 * Ranglar:
 * - Navbar fon: primary-600 (blue).
 * - PillNav: white pill'lar, hover'da white to'ldiradi, matn blue.
 * - Mobil active: white ikonka foni.
 * - Logo: white.
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
      <header className="sticky top-0 z-100 flex h-12 items-center justify-between border-b border-primary-700 bg-primary-600 px-4 md:hidden">
        <Link
          href={brandHref}
          className="text-base font-bold tracking-tight"
        >
          <ShinyText
            text={brand}
            speed={4}
            color="#ffffff"
            shineColor="#93c5fd"
            className="text-base font-bold"
          />
        </Link>
        <div className="flex items-center gap-2 [&_button]:text-white [&_a]:text-white">{actions}</div>
      </header>

      {/* ═══ Desktop navbar (md+) ═══ */}
      <nav
        className="sticky top-0 z-100 hidden border-b border-primary-700 bg-primary-600 md:block"
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
              color="#ffffff"
              shineColor="#93c5fd"
              className="text-lg font-bold"
            />
          </Link>

          {/* Nav — PillNav (gsap hover-fill) */}
          <PillNav
            items={pillItems}
            baseColor="#ffffff"
            pillColor="rgba(255,255,255,0.15)"
            hoveredPillTextColor="#1d4ed8"
            pillTextColor="#ffffff"
          />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 [&_button]:text-white [&_a]:text-white">{actions}</div>
        </div>
      </nav>

      {/* ═══ Mobil bottom bar (<md) ═══ */}
      <nav
        aria-label="Mobil navigatsiya"
        className="fixed inset-x-0 bottom-0 z-100 rounded-t-2xl border border-primary-700 border-b-0 bg-primary-600 md:hidden"
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
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-all duration-200 hover:bg-white/10 active:scale-[0.97] ${
                    isActive
                      ? "text-white"
                      : "text-blue-200 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-blue-200 hover:bg-white/20 hover:text-white"
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
