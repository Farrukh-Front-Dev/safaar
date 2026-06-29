import type { LandingDict } from "@/i18n/dictionaries";
import { NoiseBackground } from "@/components/ui/noise-background";

/** "Nega UzBron?" — 4 ta afzallik kartasi (animatsiyali gradient border bilan). */
export function LandingFeatures({ dict }: { dict: LandingDict["features"] }) {
  const items = [
    { key: "price", icon: <TagIcon /> },
    { key: "instant", icon: <BoltIcon /> },
    { key: "secure", icon: <ShieldIcon /> },
    { key: "support", icon: <ChatIcon /> },
  ] as const;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight">{dict.title}</h2>
        <p className="mt-2 text-slate-500">{dict.subtitle}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ key, icon }) => {
          const item = dict.items[key];
          return (
            <NoiseBackground
              key={key}
              gradientColors={["#0d9488", "#14b8a6", "#ea580c"]}
              noiseIntensity={0.1}
              containerClassName="h-full rounded-2xl bg-primary-100 p-[3px] shadow-sm"
              className="h-full"
            >
              <div className="flex h-full flex-col gap-3 rounded-[14px] bg-white p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  {icon}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.text}</p>
              </div>
            </NoiseBackground>
          );
        })}
      </div>
    </section>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d="M4 4h7l9 9-7 7-9-9V4Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}
