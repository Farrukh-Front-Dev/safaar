import type { HomeDict } from "@/i18n/dictionaries";

/**
 * Bosh sahifa hero bloki — "Samarqand Turkuaz" gradient fon, brend eyebrow,
 * sarlavha va izoh. Qidiruv kartasi (SearchBar) hero'ning pastiga "suzib"
 * chiqishi uchun bu blok pastdan qo'shimcha bo'shliq (pb) qoldiradi.
 */
export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-700 via-primary-600 to-primary-500">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-16 text-white sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
          {dict.eyebrow}
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {dict.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/85">{dict.subtitle}</p>
      </div>
    </section>
  );
}
