import Link from "next/link";
import { Home, Hotel, Bus, MountainSnow, UserCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import ShinyText from "@/components/ui/ShinyText";
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
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary-600 px-5 text-sm font-medium text-white shadow-btn transition-all duration-150 hover:bg-primary-500 hover:shadow-btn-hover active:bg-primary-700 active:shadow-btn-active active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        >
          <ShinyText
            text={dict.actions.login}
            speed={3}
            color="#ffffff"
            shineColor="#bbf7d0"
            className="text-sm font-medium"
          />
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
