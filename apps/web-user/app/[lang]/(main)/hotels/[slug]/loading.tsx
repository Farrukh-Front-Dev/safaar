/**
 * Mehmonxona tafsiloti yuklanayotganda ko'rinadigan skeleton (CWV uchun).
 * Sahifa tarkibi (galereya, sarlavha, xonalar) kelguncha shu fallback chiqadi.
 */
export default function HotelDetailLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
      {/* Galereya */}
      <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />

      {/* Sarlavha */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
          <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </main>
  );
}
