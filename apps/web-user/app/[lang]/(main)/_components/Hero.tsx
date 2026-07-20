import type { HomeDict } from "@/i18n/dictionaries";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
      {/* Background ambient gradient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary-500/20 via-sky-400/15 to-emerald-400/10 blur-3xl sm:h-[450px] sm:w-[800px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-md transition-transform duration-200 hover:scale-105 sm:text-sm dark:border-primary-500/30 dark:bg-slate-900/80 dark:text-primary-300">
          <Sparkles className="h-4 w-4 animate-pulse text-amber-500" aria-hidden />
          <span>O'zbekistondagi #1 Milliy Bron Qilish Platformasi</span>
        </div>

        {/* Title */}
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          <span className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-800 bg-clip-text text-transparent dark:from-white dark:via-primary-200 dark:to-slate-200">
            {dict.title}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg md:text-xl dark:text-slate-300">
          {dict.subtitle}
        </p>

        {/* Trust Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 sm:gap-6 sm:text-sm dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-emerald-500" /> Soniyalarda tezkor tasdiq
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary-500" /> Kafoilatlangan eng yaxshi narxlar
          </span>
        </div>
      </div>
    </section>
  );
}
