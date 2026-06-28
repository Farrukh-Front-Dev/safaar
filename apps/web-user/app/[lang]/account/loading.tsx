/**
 * Kabinet tarkibi yuklanayotganda ko'rinadigan skeleton.
 * `account/layout.tsx` (sarlavha + AccountNav) saqlanadi, faqat tarkib joyida
 * shu fallback chiqadi. Barcha kabinet sahifalarini (profil, bronlar,
 * sevimlilar, bonuslar) qoplaydi.
 */
export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}
