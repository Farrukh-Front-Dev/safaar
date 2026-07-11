"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ScrollNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

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

  return (
    <>
      <header className="sticky top-0 z-100 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link href={brandHref} className="text-base font-bold tracking-tight text-slate-800">
          {brand}
        </Link>
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      <nav className="sticky top-0 z-100 hidden border-b border-slate-200 bg-white shadow-sm md:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href={brandHref} className="shrink-0 text-lg font-bold text-slate-800">
            {brand}
          </Link>

          <div className="flex items-center gap-1">
            {items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      </nav>

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

      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:hidden" />
    </>
  );
}
