"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { logoutAction } from "@/lib/auth/actions";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuLabels {
  account: string;
  login: string;
  logout: string;
}

const MENU_LABEL: Record<Locale, { open: string; close: string }> = {
  uz: { open: "Menyu", close: "Yopish" },
  ru: { open: "Меню", close: "Закрыть" },
  en: { open: "Menu", close: "Close" },
};

/**
 * Mobil navigatsiya — hamburger tugma + ochiladigan panel (md dan kichik ekran).
 * A11y: aria-expanded/controls, Escape bilan yopish, route o'zgarsa avtomatik yopiladi.
 */
export function MobileMenu({
  locale,
  items,
  authed,
  labels,
}: {
  locale: Locale;
  items: NavItem[];
  authed: boolean;
  labels: MobileMenuLabels;
}) {
  const [open, setOpen] = useState(false);
  const t = MENU_LABEL[locale];

  // Escape bilan yopish + ochiq paytda scroll qotirish.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t.close : t.open}
        className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {open && (
        <>
          {/* Fon overlay */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-slate-900/20"
          />
          {/* Floating panel (pill uslubiga mos) */}
          <div
            id="mobile-menu"
            className="fixed inset-x-4 top-19 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <nav aria-label="Mobil menyu" className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="my-3 border-t border-slate-200" />

            <div className="flex flex-col gap-3">
              {authed ? (
                <>
                  <Link
                    href={`/${locale}/account`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    {labels.account}
                  </Link>
                  <form action={logoutAction.bind(null, locale)}>
                    <button
                      type="submit"
                      className="w-full rounded-full border border-slate-300 px-3 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-50"
                    >
                      {labels.logout}
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-primary-600 px-3 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  {labels.login}
                </Link>
              )}

              <div className="flex items-center justify-between pt-1">
                <LocaleSwitcher current={locale} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
