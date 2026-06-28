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
    <footer className="mt-auto border-t border-black/10 dark:border-white/15">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-blue-600">{dict.brand}</p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            {dict.footer.tagline}
          </p>
        </div>
        <nav aria-label="Footer menyu" className="flex flex-wrap gap-4 text-sm">
          <Link href={`${base}/about`} className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400">
            {dict.nav.about}
          </Link>
          <Link href={`${base}/help`} className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400">
            {dict.nav.help}
          </Link>
        </nav>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-xs text-zinc-400 dark:border-white/10">
        © {year} {dict.brand}. {dict.footer.rights}
      </div>
    </footer>
  );
}
