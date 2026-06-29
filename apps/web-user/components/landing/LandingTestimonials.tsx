import type { LandingDict } from "@/i18n/dictionaries";

/** Mijozlar fikri — sharhlar kartalari. */
export function LandingTestimonials({
  dict,
}: {
  dict: LandingDict["testimonials"];
}) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{dict.title}</h2>
          <p className="mt-2 text-slate-500">{dict.subtitle}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {dict.items.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-amber-500" aria-hidden>
                {"★★★★★"}
              </div>
              <blockquote className="flex-1 text-sm text-slate-700">
                “{item.text}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-100 font-bold text-primary-700">
                  {item.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className="block text-xs text-slate-500">{item.city}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
