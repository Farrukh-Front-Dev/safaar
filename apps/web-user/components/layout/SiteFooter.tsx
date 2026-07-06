import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { CommonDict } from "@/i18n/dictionaries";

/**
 * Sayt pastki qismi — oq fon, to'q matnlar, border bilan ajratilgan.
 */
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
    <footer className="mt-auto border-t border-slate-200">
      {/* Asosiy qism */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-10">
        {/* Brend + tagline */}
        <div>
          <p className="text-lg font-bold text-slate-900">{dict.brand}</p>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
            {dict.footer.tagline}
          </p>
        </div>

        {/* Nav linklar */}
        <nav
          aria-label="Footer menyu"
          className="flex flex-wrap gap-4 text-sm sm:gap-5"
        >
          <Link
            href={`${base}/about`}
            className="text-slate-600 transition-colors hover:text-primary-600"
          >
            {dict.nav.about}
          </Link>
          <Link
            href={`${base}/help`}
            className="text-slate-600 transition-colors hover:text-primary-600"
          >
            {dict.nav.help}
          </Link>
          <Link
            href={`${base}/terms`}
            className="text-slate-600 transition-colors hover:text-primary-600"
          >
            {dict.nav.terms}
          </Link>
        </nav>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400">
        © {year} {dict.brand}. {dict.footer.rights}
      </div>
    </footer>
  );
}
