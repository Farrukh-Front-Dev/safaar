import type { Locale } from "@/i18n/config";
import type { ReviewsDict } from "@/i18n/dictionaries";
import type { ReviewView } from "@/types/view";

const LOCALE_TAG: Record<Locale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

/** ISO sanani tilga mos formatlash. Bo'sh/noto'g'ri bo'lsa `null`. */
function formatReviewDate(createdAt: string, locale: Locale): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Sharhlar ro'yxati — mehmonxona va avtobus kompaniyasi detal sahifalarida.
 * SERVER komponent: interaktivlik yo'q, faqat ko'rsatish.
 */
export function ReviewsList({
  reviews,
  dict,
  locale,
}: {
  reviews: ReviewView[];
  dict: ReviewsDict;
  locale: Locale;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{dict.title}</h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">{dict.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => {
            const rating = Math.max(0, Math.min(5, Math.round(review.rating)));
            const dateLabel = formatReviewDate(review.createdAt, locale);
            return (
              <li
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-amber-500"
                    aria-label={`Reyting ${rating}`}
                  >
                    {"★".repeat(rating)}
                  </span>
                  {dateLabel && (
                    <time
                      dateTime={review.createdAt}
                      className="text-xs text-slate-400"
                    >
                      {dateLabel}
                    </time>
                  )}
                </div>
                {review.body && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {review.body}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
