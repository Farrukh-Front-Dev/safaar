import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { PillNav } from "@/components/PillNav";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";

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
    { href: `${base}/help`, label: dict.nav.help },
  ];

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/85 px-5 shadow-sm backdrop-blur">
        <Link
          href={`${base}/welcome`}
          className="text-xl font-bold tracking-tight text-primary-600"
        >
          {dict.brand}
        </Link>

        <PillNav items={navItems} className="hidden md:block" />

        {/* Desktop harakatlar */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher current={locale} />
          {authed ? (
            <div className="flex items-center gap-2">
              <Link
                href={`${base}/account`}
                className="inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
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
              className="inline-flex h-8 items-center justify-center rounded-full bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {dict.actions.login}
            </Link>
          )}
        </div>

        {/* Mobil menyu */}
        <MobileMenu
          locale={locale}
          items={navItems}
          authed={authed}
          labels={{
            account: dict.actions.account,
            login: dict.actions.login,
            logout: dict.actions.logout,
          }}
        />
      </div>
    </header>
  );
}
