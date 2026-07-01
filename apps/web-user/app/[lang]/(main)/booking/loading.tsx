/**
 * Checkout (bron qilish) sahifasi yuklanayotganda ko'rinadigan skeleton.
 */
export default function CheckoutLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </main>
  );
}
