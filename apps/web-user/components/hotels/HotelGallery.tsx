import Image from "next/image";
import { cn } from "@/lib/cn";
import { SHOW_PLACEHOLDER_PHOTOS, placeholderPhoto } from "@/lib/images";

export function HotelGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const real = images.filter((src) => src.startsWith("http"));
  const shots =
    real.length > 0
      ? real
      : SHOW_PLACEHOLDER_PHOTOS
        ? Array.from({ length: 4 }, (_, i) =>
            placeholderPhoto(`${alt}-${i}`, 1280, 720),
          )
        : [];

  if (shots.length === 0) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-slate-100 text-2xl font-semibold text-primary-900/60 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300"
      >
        {alt}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2 overflow-hidden rounded-2xl shadow-btn",
        shots.length > 1 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {shots.slice(0, 4).map((src, i) => (
        <div key={src} className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={src}
            alt={`${alt} — ${i + 1}`}
            priority={i === 0}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
