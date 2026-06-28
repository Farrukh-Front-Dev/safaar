/**
 * Avtobus reyslari sahifasi yuklanayotganda ko'rinadigan skeleton (CWV uchun).
 * Layout darhol chiqadi, ma'lumot kelguncha shu fallback ko'rsatiladi.
 */
export default function BusesLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <div className="h-8 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    </main>
  );
}
