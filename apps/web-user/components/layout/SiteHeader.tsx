import Link from "next/link";
import { Home, Hotel, Bus, MountainSnow, HelpCircle, UserCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import ShinyText from "@/components/ui/ShinyText";
import { ScrollNav, type ScrollNavItem } from "./ScrollNav";
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

  const desktopItems: ScrollNavItem[] = [
    { href: base, label: dict.nav.home, icon: <Home className="h-4 w-4" />, exact: true },
    { href: `${base}/hotels`, label: dict.nav.hotels, icon: <Hotel className="h-4 w-4" /> },
    { href: `${base}/buses`, label: dict.nav.transport, icon: <Bus className="h-4 w-4" /> },
    { href: `${base}/attractions`, label: dict.nav.attractions, icon: <MountainSnow className="h-4 w-4" /> },
    { href: `${base}/help`, label: dict.nav.help, icon: <HelpCircle className="h-4 w-4" /> },
  ];

  const mobileItems: ScrollNavItem[] = [
    { href: base, label: dict.nav.home, icon: <Home className="h-5 w-5" />, exact: true },
    { href: `${base}/hotels`, label: dict.nav.hotels, icon: <Hotel className="h-5 w-5" /> },
    { href: `${base}/buses`, label: dict.nav.transport, icon: <Bus className="h-5 w-5" /> },
    {
      href: authed ? `${base}/account` : `${base}/login`,
      label: authed ? dict.actions.account : dict.actions.login,
      icon: <UserCircle className="h-5 w-5" />,
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
      items={desktopItems}
      mobileItems={mobileItems}
      brand={dict.brand}
      brandHref={base}
      actions={actions}
    />
  );
}
