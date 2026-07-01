/**
 * Avtobus reysi tafsiloti yuklanayotganda ko'rinadigan skeleton (CWV uchun).
 */
export default function BusDetailLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

      {/* Sarlavha + ma'lumotlar qatori */}
      <div className="flex flex-col gap-3">
        <div className="h-8 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="flex flex-wrap gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>

      {/* Joylar to'ri + xulosa */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-80 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </main>
  );
}
