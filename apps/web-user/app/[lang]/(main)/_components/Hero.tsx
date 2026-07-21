import type { HomeDict } from "@/i18n/dictionaries";
import { ShieldCheck, Zap } from "lucide-react";

export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
      {/* Background ambient gradient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary-500/20 via-sky-400/15 to-emerald-400/10 blur-3xl sm:h-[450px] sm:w-[800px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Title */}
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          <span className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-800 bg-clip-text text-transparent dark:from-white dark:via-primary-200 dark:to-slate-200">
            {dict.title}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-slate-800 sm:text-lg md:text-xl">
          {dict.subtitle}
        </p>

        {/* Trust Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xs sm:text-sm">
            <Zap className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden />
            <span>Soniyalarda tezkor tasdiq</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xs sm:text-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" aria-hidden />
            <span>Kafolatlangan eng yaxshi narxlar</span>
          </span>
        </div>
      </div>
    </section>
  );
}
