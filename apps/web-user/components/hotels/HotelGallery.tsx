/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/cn";

/**
 * Mehmonxona rasm galereyasi.
 *
 * Hozir backend demo rasmlari mavjud emas (nisbiy fake yo'llar), shuning uchun
 * faqat haqiqiy (http) URL'lar `<img>` sifatida ko'rsatiladi; aks holda neytral
 * placeholder. Dizayn bosqichida `next/image` + storage URL bilan almashtiriladi.
 * (`next/image` hozir ishlatilmadi: remote dom-config va mavjud bo'lmagan
 * fayllar build/runtime shovqinini keltirib chiqarmasligi uchun.)
 */
export function HotelGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const real = images.filter((src) => src.startsWith("http"));

  if (real.length === 0) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex aspect-video w-full items-center justify-center rounded-2xl bg-linear-to-br from-primary-100 to-slate-100 text-2xl font-semibold text-primary-900/60"
      >
        {alt}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2 overflow-hidden rounded-2xl",
        real.length > 1 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {real.slice(0, 4).map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} — ${i + 1}`}
          className="aspect-video h-full w-full object-cover"
        />
      ))}
    </div>
  );
}
