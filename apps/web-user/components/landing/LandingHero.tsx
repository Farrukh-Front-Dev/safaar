import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { LandingDict } from "@/i18n/dictionaries";

/** Marketing landing — to'liq ekran hero: Samarqand Registon foni + overlay + CTA. */
export function LandingHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: LandingDict["hero"];
}) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Fon rasm — Samarqand Registon. next/image fill + object-cover bilan
          har qanday ekranga (mobil/desktop) moslashadi; priority — LCP uchun. */}
      <Image
        src="/samarqand-registan-picture.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      {/* Matn kontrasti uchun gradient scrim — chapdan to'q (matn shu yerda),
          o'ngga ochiladi, shunda Registon ko'rinib turadi. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-slate-950/85 via-slate-900/60 to-slate-900/30" />
      {/* Pastdan yengil to'qlashuv — mobilda ham matn o'qiladi. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

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
