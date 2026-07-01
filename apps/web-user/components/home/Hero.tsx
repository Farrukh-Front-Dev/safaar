import type { HomeDict } from "@/i18n/dictionaries";

/**
 * Bosh sahifa hero — minimal, brend emerald gradient fon + yengil nuqta pattern.
 * Pastda yumshoq oq o'tish: floating qidiruv kartasi (SearchBar, `-mt`) hero
 * bilan silliq ulanadi (chok ko'rinmaydi). Responsiv: mobil'da ixcham, katta
 * ekranda kengroq tipografika.
 */
export function Hero({ dict }: { dict: HomeDict["hero"] }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-700 via-primary-600 to-primary-500">
      {/* Yengil nuqta patterni — minimal tekstura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      {/* Pastki yumshoq oq o'tish — qidiruv kartasi bilan silliq ulanish */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-white"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-24 text-white sm:pb-32 sm:pt-32">
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          {dict.title}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          {dict.subtitle}
        </p>
      </div>
    </section>
  );
}
