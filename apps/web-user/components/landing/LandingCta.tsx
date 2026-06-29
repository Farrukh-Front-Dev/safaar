import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { LandingDict } from "@/i18n/dictionaries";
import { NoiseBackground } from "@/components/ui/noise-background";

/** Yakuniy CTA bloki — animatsiyali gradient border + gradient fon + katta tugma. */
export function LandingCta({
  locale,
  dict,
}: {
  locale: Locale;
  dict: LandingDict["cta"];
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <NoiseBackground
        gradientColors={["#0d9488", "#14b8a6", "#ea580c"]}
        noiseIntensity={0.12}
        containerClassName="rounded-[28px] bg-primary-200 p-[3px] shadow-lg"
      >
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-700 via-primary-600 to-primary-500 px-8 py-14 text-center text-white sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {dict.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{dict.subtitle}</p>
          <Link
            href={`/${locale}/hotels`}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent-600 px-8 font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
          >
            {dict.button}
          </Link>
        </div>
        </div>
      </NoiseBackground>
    </section>
  );
}
