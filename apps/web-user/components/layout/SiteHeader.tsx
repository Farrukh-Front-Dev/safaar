import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader({
  locale,
  dict,
  authed,
}: {
  locale: Locale;
  dict: CommonDict;
  authed: boolean;
}) {
  const base = `/${locale}`;
  const navItems = [
    { href: `${base}/hotels`, label: dict.nav.hotels },
    { href: `${base}/buses`, label: dict.nav.buses },
    { href: `${base}/help`, label: dict.nav.help },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href={base}
          className="text-xl font-bold tracking-tight text-primary-600"
        >
          {dict.brand}
        </Link>

        <nav
          aria-label="Asosiy menyu"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          {authed ? (
            <div className="flex items-center gap-2">
              <Link
                href={`${base}/account`}
                className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {dict.actions.account}
              </Link>
              <form action={logoutAction.bind(null, locale)}>
                <Button size="sm" variant="secondary" type="submit">
                  {dict.actions.logout}
                </Button>
              </form>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary-600 px-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {dict.actions.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
