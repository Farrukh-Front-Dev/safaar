import type { HomeDict } from "@/i18n/dictionaries";

/**
 * Hero — birinchi ekran sarlavhasi.
 * Mobile-first: mobilda ixcham padding, desktop'da kengayadi.
 */
export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative pb-20 pt-28 sm:pb-28 sm:pt-36 md:pb-32 md:pt-44 lg:pt-48">
      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">
          {dict.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 sm:mt-4 sm:max-w-lg sm:text-base md:text-lg">
          {dict.subtitle}
        </p>
      </div>
    </section>
  );
}
