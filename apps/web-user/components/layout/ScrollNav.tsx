"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import ShinyText from "@/components/ui/ShinyText";
import { cn } from "@/lib/cn";

export type ScrollNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
  children?: ScrollNavItem[];
};

interface Props {
  items: ScrollNavItem[];
  brand: string;
  brandHref: string;
  actions: React.ReactNode;
  localeSwitcher?: React.ReactNode;
  authActions?: React.ReactNode;
}

function NavDropdown({ item, pathname }: { item: ScrollNavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const hasActiveChild = item.children && item.children.some(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
  );
  const active = hasActiveChild || isActive(pathname, item.href, item.exact);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-all duration-150",
          active
            ? "border border-white/60 bg-white/20 text-white shadow-xs"
            : "text-white/95 hover:bg-white/15 hover:text-white",
        )}
      >
        {item.icon}
        <span className="text-sm font-bold tracking-wide">{item.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform text-white/90", open && "rotate-180")} />
      </button>
      {open && item.children && (
        <div className="absolute left-0 top-full mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
          {item.children.map((child) => {
            const childActive = isActive(pathname, child.href, child.exact);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-bold transition-colors",
                  childActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-900 hover:bg-slate-100",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center">{child.icon}</span>
                <span className="text-sm font-bold">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function ScrollNav({ items, brand, brandHref, actions, localeSwitcher, authActions }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ═══ Mobile header ═══ */}
      <header className="sticky top-0 z-100 flex h-12 items-center justify-between border-b border-sky-300/30 bg-blue-600 px-4 text-white md:hidden">
        <Link href={brandHref}>
          <ShinyText
            text={brand}
            speed={6}
            color="#ffffff"
            shineColor="#7dd3fc"
            className="font-black tracking-wide text-lg sm:text-xl text-white"
          />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Yopish" : "Menyu"}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 active:scale-90"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ═══ Mobile drawer ═══ */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/20 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <nav
            aria-label="Mobil navigatsiya"
            className="fixed inset-x-4 top-16 z-100 rounded-2xl border border-slate-300 bg-white p-2.5 shadow-xl md:hidden"
          >
            {items.map((item) => {
              if (item.children && item.children.length > 0) {
                return item.children.map((child) => {
                  const childActive = isActive(pathname, child.href, child.exact);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={childActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                        childActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-900 hover:bg-slate-100",
                      )}
                    >
                      <span className="flex h-7 w-7 items-center justify-center">{child.icon}</span>
                      <span className="text-sm font-bold">{child.label}</span>
                    </Link>
                  );
                });
              }
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center">{item.icon}</span>
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              );
            })}
            <hr className="my-2.5 border-slate-200" />
            <div className="space-y-3 px-4 py-2">
              {localeSwitcher && (
                <div className="flex justify-center">{localeSwitcher}</div>
              )}
              {authActions && (
                <div className="flex flex-col gap-2">
                  {authActions}
                </div>
              )}
            </div>
          </nav>
        </>
      )}

      {/* ═══ Desktop navbar ═══ */}
      <nav className="sticky top-0 z-100 hidden border-b border-sky-300/30 bg-blue-600 shadow-md md:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href={brandHref} className="shrink-0">
            <ShinyText
              text={brand}
              speed={6}
              color="#ffffff"
              shineColor="#7dd3fc"
              className="font-black tracking-wide text-lg sm:text-xl text-white"
            />
          </Link>

          <div className="flex items-center gap-1">
            {items.map((item) => {
              if (item.children) {
                return <NavDropdown key={item.href} item={item} pathname={pathname} />;
              }
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-all duration-150",
                    active
                      ? "border border-white/60 bg-white/20 text-white shadow-xs"
                      : "text-white/95 hover:bg-white/15 hover:text-white",
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-bold tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
        </div>
      </nav>
    </>
  );
}
