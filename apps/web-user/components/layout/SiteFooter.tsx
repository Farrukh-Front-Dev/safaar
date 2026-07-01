import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: CommonDict;
}) {
  const base = `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10">
        <div>
          <p className="text-base font-bold text-white sm:text-lg">{dict.brand}</p>
          <p className="mt-1 max-w-sm text-xs text-white/60 sm:text-sm">
            {dict.footer.tagline}
          </p>
        </div>
        <nav aria-label="Footer menyu" className="flex flex-wrap gap-3 text-xs sm:gap-4 sm:text-sm">
          <Link href={`${base}/about`} className="text-white/70 transition-colors hover:text-white">
            {dict.nav.about}
          </Link>
          <Link href={`${base}/help`} className="text-white/70 transition-colors hover:text-white">
            {dict.nav.help}
          </Link>
          <Link href={`${base}/terms`} className="text-white/70 transition-colors hover:text-white">
            {dict.nav.terms}
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-center text-[10px] text-white/40 sm:py-4 sm:text-xs">
        © {year} {dict.brand}. {dict.footer.rights}
      </div>
    </footer>
  );
}
