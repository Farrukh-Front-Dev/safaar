export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="aspect-16/9 w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col gap-2.5 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800/60" />
              <div className="mt-2 h-5 w-1/3 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
