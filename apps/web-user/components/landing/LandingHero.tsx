/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { LandingDict } from "@/i18n/dictionaries";
import { SHOW_PLACEHOLDER_PHOTOS, placeholderPhoto } from "@/lib/images";

/** Marketing landing — to'liq ekran hero: fon rasm + overlay + sarlavha + CTA. */
export function LandingHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: LandingDict["hero"];
}) {
  const bg = SHOW_PLACEHOLDER_PHOTOS
    ? placeholderPhoto("uzbekistan-hero-landing", 1600, 900)
    : null;

  return (
    <section className="relative isolate overflow-hidden">
      {bg && (
        <img
          src={bg}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary-900/90 via-primary-800/80 to-slate-900/85" />

      <div className="mx-auto w-full max-w-6xl px-6 py-28 text-white sm:py-36">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
          {dict.badge}
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          {dict.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/85 sm:text-xl">
          {dict.subtitle}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/hotels`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent-600 px-7 font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
          >
            {dict.ctaPrimary}
          </Link>
          <Link
            href={`/${locale}/buses`}
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {dict.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
