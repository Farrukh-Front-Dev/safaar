import { Search } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";

export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600 pb-16 pt-24 sm:pt-32 lg:pt-40">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {dict.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100 sm:text-lg md:text-xl">
          {dict.subtitle}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="#search-section"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-95"
          >
            <Search className="h-4 w-4" />
            Bron qilish
          </a>
        </div>
      </div>
    </section>
  );
}
