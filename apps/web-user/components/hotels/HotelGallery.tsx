/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/cn";
import { SHOW_PLACEHOLDER_PHOTOS, placeholderPhoto } from "@/lib/images";

/**
 * Mehmonxona rasm galereyasi.
 *
 * Real (http) rasmlar bo'lsa — ularni ko'rsatadi. Bo'lmasa, DEV rejimida
 * deterministik placeholder fotolar; PRODUCTION'da neytral gradient placeholder.
 */
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
        className="flex aspect-video w-full items-center justify-center rounded-2xl bg-linear-to-br from-primary-100 to-slate-100 text-2xl font-semibold text-primary-900/60"
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
        <img
          key={src}
          src={src}
          alt={`${alt} — ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          className="aspect-video h-full w-full object-cover"
        />
      ))}
    </div>
  );
}
