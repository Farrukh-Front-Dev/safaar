import type { HomeDict } from "@/i18n/dictionaries";

export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative overflow-hidden pb-12 pt-16 sm:pt-20 lg:pt-24">
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
          {dict.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl">
          {dict.subtitle}
        </p>
      </div>
    </section>
  );
}
