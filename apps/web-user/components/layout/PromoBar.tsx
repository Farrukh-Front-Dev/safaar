/**
 * Chegirma/aksiya bari — saytning eng tepasida.
 * Liquid glass (blur) uslubida — amber shaffof fon.
 * Matn `common.promo` dan keladi (3 tilda). Keyin CMS/promo API'ga ulanadi.
 */
export function PromoBar({ text }: { text: string }) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-110 flex h-9 items-center justify-center border-b border-white/20 px-4 text-center text-xs font-semibold text-white sm:text-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(234,88,12,0.55), rgba(245,158,11,0.4))",
        backdropFilter: "blur(28px) saturate(200%)",
        WebkitBackdropFilter: "blur(28px) saturate(200%)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25)",
      }}
    >
      <span className="line-clamp-1 drop-shadow-sm">{text}</span>
    </div>
  );
}
