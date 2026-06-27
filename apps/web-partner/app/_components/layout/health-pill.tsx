import { Sparkles } from "lucide-react";

/**
 * Hozircha demo rejim — backend ulanmagan.
 * Backend tayyor bo'lganda bu komponent real `/health` endpoint'ini
 * polling qiladi va online/offline holatini ko'rsatadi.
 */
export function HealthPill() {
  return (
    <span
      role="status"
      className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 md:inline-flex dark:bg-brand-900/40 dark:text-brand-200"
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      Demo rejim
    </span>
  );
}
