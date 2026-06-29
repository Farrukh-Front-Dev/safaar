import type { HomeDict } from "@/i18n/dictionaries";

/** "Nega UzBron?" trust bloki — 3 ta afzallik ikonka + matn bilan. */
export function WhyUzBron({ dict }: { dict: HomeDict["why"] }) {
  const items = [
    { key: "instant", icon: <BoltIcon /> },
    { key: "secure", icon: <ShieldIcon /> },
    { key: "support", icon: <ChatIcon /> },
  ] as const;

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{dict.title}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map(({ key, icon }) => {
            const item = dict.items[key];
            return (
              <div key={key} className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
