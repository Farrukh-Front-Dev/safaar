/**
 * Chegirma/aksiya bari — saytning eng tepasida.
 * Normal flow (fixed emas) — navbar undan pastda sticky turadi.
 * Matn `common.promo` dan keladi (3 tilda). Keyin CMS/promo API'ga ulanadi.
 */
export function PromoBar({ text }: { text: string }) {
  return (
    <div
      className="flex h-9 items-center justify-center border-b border-amber-200/40 bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-center text-xs font-semibold text-white sm:text-sm"
    >
      <span className="line-clamp-1 drop-shadow-sm">{text}</span>
    </div>
  );
}
