import Link from "next/link";
import { Home, Hotel, Bus, MountainSnow, HelpCircle } from "lucide-react";
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

  const localeSwitcher = <LocaleSwitcher current={locale} />;
  const localeSwitcherLight = <LocaleSwitcher current={locale} light />;

  const authActions = authed ? (
    <div className="flex items-center gap-1.5">
      <Link
        href={`${base}/account`}
        className="inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
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
    <div className="flex items-center gap-2">
      <Link
        href={`/${locale}/login`}
        className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-primary-700 shadow-btn transition-all duration-150 hover:bg-white/90 hover:shadow-btn-hover active:scale-[0.97]"
      >
        <ShinyText
          text={dict.actions.login}
          speed={3}
          color="#1d4ed8"
          shineColor="#93c5fd"
          className="text-sm font-medium"
        />
      </Link>
      <Link
        href={`/${locale}/register`}
        className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-primary-700 shadow-btn transition-all duration-150 hover:bg-white/90 hover:shadow-btn-hover active:scale-[0.97]"
      >
        <ShinyText
          text={dict.actions.register}
          speed={3}
          color="#1d4ed8"
          shineColor="#93c5fd"
          className="text-sm font-medium"
        />
      </Link>
    </div>
  );

  const authActionsLight = authed ? (
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
    <div className="flex flex-col gap-2">
      <Link
        href={`/${locale}/login`}
        className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-btn transition-all duration-150 hover:bg-slate-50 hover:shadow-btn-hover active:scale-[0.97]"
      >
        {dict.actions.login}
      </Link>
      <Link
        href={`/${locale}/register`}
        className="inline-flex h-10 items-center justify-center rounded-full bg-primary-600 px-4 text-sm font-medium text-white shadow-btn transition-all duration-150 hover:bg-primary-500 hover:shadow-btn-hover active:bg-primary-700 active:shadow-btn-active active:scale-[0.97]"
      >
        <ShinyText
          text={dict.actions.register}
          speed={3}
          color="#ffffff"
          shineColor="#bbf7d0"
          className="text-sm font-medium"
        />
      </Link>
    </div>
  );

  const actions = (
    <>
      {localeSwitcher}
      {authActions}
    </>
  );

  return (
    <ScrollNav
      items={desktopItems}
      brand={dict.brand}
      brandHref={base}
      actions={actions}
      localeSwitcher={localeSwitcherLight}
      authActions={authActionsLight}
    />
  );
}
