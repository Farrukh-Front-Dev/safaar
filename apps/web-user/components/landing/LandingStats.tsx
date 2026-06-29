import type { LandingDict } from "@/i18n/dictionaries";

/** Statistika qatori — ishonch ko'rsatkichlari (raqamlar locale-agnostik). */
export function LandingStats({ dict }: { dict: LandingDict["stats"] }) {
  const stats = [
    { value: "500+", label: dict.hotels },
    { value: "50 000+", label: dict.customers },
    { value: "30+", label: dict.cities },
    { value: "24/7", label: dict.support },
  ];

  return (
    <section className="relative z-10 mx-auto -mt-10 w-full max-w-5xl px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 text-center">
            <p className="text-3xl font-bold tracking-tight text-primary-600">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
