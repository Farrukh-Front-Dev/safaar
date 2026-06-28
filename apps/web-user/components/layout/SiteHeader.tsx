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
    { href: `${base}/about`, label: dict.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/15 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href={base}
          className="text-xl font-bold tracking-tight text-blue-600"
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
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          {authed ? (
            <form action={logoutAction.bind(null, locale)}>
              <Button size="sm" variant="secondary" type="submit">
                {dict.actions.logout}
              </Button>
            </form>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {dict.actions.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
