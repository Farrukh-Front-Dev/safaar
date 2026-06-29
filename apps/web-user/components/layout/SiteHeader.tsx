import Link from "next/link";
import { Hotel, Bus, MountainSnow } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { ScrollNav } from "./ScrollNav";
import { LocaleSwitcher } from "./LocaleSwitcher";

/* Ikonlar — mobil bottom bar uchun (lucide-react) */
const HotelIcon = <Hotel className="h-5 w-5" aria-hidden />;
const TransportIcon = <Bus className="h-5 w-5" aria-hidden />;
const AttractionsIcon = <MountainSnow className="h-5 w-5" aria-hidden />;

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
    { href: `${base}/hotels`, label: dict.nav.hotels, icon: HotelIcon },
    { href: `${base}/transport`, label: dict.nav.transport, icon: TransportIcon },
    { href: `${base}/attractions`, label: dict.nav.attractions, icon: AttractionsIcon },
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
          className="inline-flex h-8 items-center justify-center rounded-full bg-primary-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:bg-primary-500 hover:shadow-md active:bg-primary-700 active:scale-[0.97]"
        >
          {dict.actions.login}
        </Link>
      )}
    </>
  );

  return (
    <ScrollNav
      items={navItems}
      brand={dict.brand}
      brandHref={base}
      actions={actions}
    />
  );
}
