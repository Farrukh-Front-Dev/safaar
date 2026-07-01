"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type ScrollNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** true bo'lsa faqat aniq mos kelganda active (home sahifa uchun). */
  exact?: boolean;
};

/**
 * Yagona navbar — scroll miqdoriga qarab asta-sekin torayadi.
 * Desktop: logo | nav linklar | actions — silliq animatsiya
 * Mobil: pastda bottom bar (ikonlar + label)
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
  const navRef = useRef<HTMLElement>(null);
  // 0 = keng (boshlang'ich), 1 = to'liq qisqargan
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    // 200px scroll'dan keyin to'liq qisqaradi
    const SCROLL_DISTANCE = 200;

    function updateNav() {
      const p = Math.min(window.scrollY / SCROLL_DISTANCE, 1);
      setProgress(p);
      rafId = null;
    }

    function onScroll() {
      if (!rafId) rafId = requestAnimationFrame(updateNav);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateNav();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Interpolated qiymatlar
  const maxW = 860; // boshlang'ich kenglik (px)
  const minW = 580; // to'liq qisqargan kenglik (px)
  const currentW = maxW - (maxW - minW) * progress;

  const padX = 32 - 12 * progress;     // 32px → 20px
  const padY = 14 - 4 * progress;      // 14px → 10px
  const gap = 24 - 12 * progress;      // 24px → 12px

  return (
    <>
      {/* ═══ Desktop navbar (md+) — Liquid Glass ═══ */}
      {/* Tashqi container markazlashtiradi (flex). Glass element'da TRANSFORM
          YO'Q — chunki transform backdrop-filter (blur)ni buzadi. */}
      <div className="pointer-events-none fixed inset-x-0 top-11 z-100 hidden justify-center md:flex">
        <nav
          ref={navRef}
          className="pointer-events-auto flex items-center justify-between rounded-full border border-white/50"
          style={{
            width: `min(${currentW}px, 88vw)`,
            maxWidth: "calc(100vw - 2rem)",
            padding: `${padY}px ${padX}px`,
            gap: `${gap}px`,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.7)",
            transition:
              "width 0.4s ease-out, padding 0.4s ease-out, gap 0.4s ease-out",
          }}
        >
        {/* Logo */}
        <Link
          href={brandHref}
          className="relative z-10 shrink-0 font-bold tracking-tight text-slate-900 transition-all duration-400 hover:text-primary-600"
          style={{ fontSize: `${18 - 2 * progress}px` }}
        >
          {brand}
        </Link>

        {/* Nav links */}
        <ul
          className="relative z-10 flex items-center"
          style={{ gap: `${4 + 4 * (1 - progress)}px`, transition: "gap 0.4s ease-out" }}
        >
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 active:scale-95
                    ${
                      isActive
                        ? "bg-primary-600 text-white shadow-[0_4px_14px_-2px_var(--brand-500)]"
                        : "text-slate-900 hover:bg-primary-50 hover:text-primary-700"
                    }
                  `}
                  style={{
                    padding: `${6 - 2 * progress}px ${16 - 6 * progress}px`,
                    transition:
                      "padding 0.4s ease-out, background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease",
                  }}
                >
                  {item.label}
                  {/* Hover uchun pastki indicator (active bo'lmaganda) */}
                  {!isActive && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary-500 transition-all duration-300 group-hover:w-4" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions (login/account/locale) */}
        <div className="relative z-10 flex shrink-0 items-center gap-1.5 lg:gap-2">{actions}</div>
        </nav>
      </div>

      {/* ═══ Mobil bottom bar (md dan kichik) — Liquid Glass ═══ */}
      {/* Transform yo'q (blur uchun) — markazlashtirish flex container orqali */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-100 flex justify-center px-3 md:hidden">
        <nav
          className="pointer-events-auto w-full max-w-md rounded-full border border-white/50"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12))",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.7)",
          }}
        >
          <ul className="flex items-center justify-around py-2">
            {(mobileItems ?? items).map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all duration-300 active:scale-90
                      ${
                        isActive
                          ? "text-primary-700"
                          : "text-slate-800 hover:text-slate-900"
                      }
                    `}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300
                        ${
                          isActive
                            ? "bg-primary-600 text-white shadow-[0_4px_12px_-2px_var(--brand-500)]"
                            : "text-slate-700"
                        }
                      `}
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
      </div>

      {/* Mobil bottom bar uchun padding */}
      <div className="h-20 md:hidden" />
    </>
  );
}
