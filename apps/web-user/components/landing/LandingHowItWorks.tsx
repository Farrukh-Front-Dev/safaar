import type { LandingDict } from "@/i18n/dictionaries";

/** "Qanday ishlaydi" — 3 qadam. */
export function LandingHowItWorks({ dict }: { dict: LandingDict["how"] }) {
  const steps = [
    { key: "search", icon: <SearchIcon /> },
    { key: "choose", icon: <CompareIcon /> },
    { key: "book", icon: <CheckIcon /> },
  ] as const;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight">{dict.title}</h2>
        <p className="mt-2 text-slate-500">{dict.subtitle}</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {steps.map(({ key, icon }, i) => {
          const step = dict.steps[key];
          return (
            <div key={key} className="relative flex flex-col items-center text-center">
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary-600">
                {icon}
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-500">{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
      <path d="M4 6h10M4 12h16M4 18h7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
