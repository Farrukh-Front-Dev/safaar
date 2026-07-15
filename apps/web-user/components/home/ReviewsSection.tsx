import { Star } from "lucide-react";
import type { HomeDict } from "@/i18n/dictionaries";

export function ReviewsSection({
  dict,
}: {
  dict: HomeDict["reviews"];
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {dict.title}
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dict.items.map((review, i) => {
          const initials = review.name
            .split(" ")
            .map((n) => n[0])
            .join("");

          return (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {review.name}
                  </p>
                  <p className="text-xs text-slate-500">{review.city}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
