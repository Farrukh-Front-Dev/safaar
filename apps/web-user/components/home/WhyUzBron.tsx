import { Zap, ShieldCheck, MessageSquare } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";

/** "Nega UzBron?" trust bloki — 3 ta afzallik ikonka + matn bilan. */
export function WhyUzBron({ dict }: { dict: HomeDict["why"] }) {
  const items = [
    { key: "instant", icon: <Zap className="h-6 w-6" aria-hidden /> },
    { key: "secure", icon: <ShieldCheck className="h-6 w-6" aria-hidden /> },
    { key: "support", icon: <MessageSquare className="h-6 w-6" aria-hidden /> },
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
