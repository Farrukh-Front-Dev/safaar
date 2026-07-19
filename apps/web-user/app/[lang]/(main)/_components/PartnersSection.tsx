import { Building2 } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";

/** Hamkor logolari — real hamkorlar bo'lguncha demo ma'lumotlar. */
const PARTNER_LOGOS = [
  { name: "Hyatt Regency", initial: "HR" },
  { name: "Hilton Tashkent", initial: "H" },
  { name: "Wyndham", initial: "W" },
  { name: "Ramada", initial: "R" },
  { name: "Lotte City Hotel", initial: "LC" },
  { name: "Miran International", initial: "MI" },
  { name: "City Palace Hotel", initial: "CP" },
  { name: "Ichan Qal'a", initial: "IQ" },
  { name: "Grand Mir", initial: "GM" },
  { name: "Orient Star", initial: "OS" },
  { name: "Asia Bukhara", initial: "AB" },
  { name: "Minor Hotel", initial: "MH" },
];

/**
 * Hamkorlar bo'limi — ishonchli brendlar ro'yxati.
 * Real logolar bo'lguncha — initials ko'rsatamiz.
 */
export function PartnersSection({
  dict,
}: {
  dict: HomeDict["partners"];
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="mb-5 text-center sm:mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {dict.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {dict.subtitle}
        </p>
      </div>

      {/* Logo grid — animatsiyali marquee effekti */}
      <div className="relative overflow-hidden py-4">
        {/* Gradient fade chekkalar */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent" aria-hidden />

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {PARTNER_LOGOS.map((partner) => (
            <div
              key={partner.name}
              className="flex h-14 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-sm sm:h-16 sm:px-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-700 sm:h-9 sm:w-9">
                {partner.initial}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Umumiy ko'rsatkich */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 sm:text-sm">
        <Building2 className="h-4 w-4" aria-hidden />
        <span>500+ mehmonxona va transport hamkorlari</span>
      </div>
    </section>
  );
}
