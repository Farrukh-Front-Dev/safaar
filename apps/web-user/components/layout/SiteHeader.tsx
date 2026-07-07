import Link from "next/link";
import { Home, Hotel, Bus, MountainSnow, UserCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { ScrollNav } from "./ScrollNav";
import { LocaleSwitcher } from "./LocaleSwitcher";

/* Ikonlar (lucide-react) */
const HomeIcon = <Home className="h-5 w-5" aria-hidden />;
const HotelIcon = <Hotel className="h-5 w-5" aria-hidden />;
const TransportIcon = <Bus className="h-5 w-5" aria-hidden />;
const AttractionsIcon = <MountainSnow className="h-5 w-5" aria-hidden />;
const AccountIcon = <UserCircle className="h-5 w-5" aria-hidden />;

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

  // Desktop navbar items
  const navItems = [
    { href: base, label: dict.nav.home, icon: HomeIcon, exact: true },
    { href: `${base}/hotels`, label: dict.nav.hotels, icon: HotelIcon },
    { href: `${base}/transport`, label: dict.nav.transport, icon: TransportIcon },
    { href: `${base}/attractions`, label: dict.nav.attractions, icon: AttractionsIcon },
  ];

  // Mobil bottom bar — 4 ta: Home, Hotels, Transport, Account/Login
  const mobileItems = [
    { href: base, label: dict.nav.home, icon: HomeIcon, exact: true },
    { href: `${base}/hotels`, label: dict.nav.hotels, icon: HotelIcon },
    { href: `${base}/transport`, label: dict.nav.transport, icon: TransportIcon },
    {
      href: authed ? `${base}/account` : `${base}/login`,
      label: authed ? dict.actions.account : dict.actions.login,
      icon: AccountIcon,
      exact: true,
    },
  ];

  const actions = (
    <>
      <LocaleSwitcher current={locale} />
      {authed ? (
        <div className="flex items-center gap-1.5">
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
          className="inline-flex h-8 items-center justify-center rounded-full bg-primary-600 px-4 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.25),0_4px_8px_-1px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_3px_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-primary-500 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.3),0_8px_16px_-2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_3px_rgba(0,0,0,0.15)] active:scale-95 active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          {dict.actions.login}
        </Link>
      )}
    </>
  );

  return (
    <ScrollNav
      items={navItems}
      mobileItems={mobileItems}
      brand={dict.brand}
      brandHref={base}
      actions={actions}
    />
  );
}
