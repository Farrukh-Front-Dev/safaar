/**
 * Natijalar sahifasi yuklanayotganda darhol ko'rinadigan skeleton (CWV uchun).
 * Layout darhol chiqadi, ma'lumot kelguncha shu fallback ko'rsatiladi.
 */
export default function HotelsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
