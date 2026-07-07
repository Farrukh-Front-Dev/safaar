import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safaar.uz";

/** Indekslanadigan public yo'llar (har til uchun takrorlanadi). */
const PUBLIC_PATHS = ["", "/hotels", "/transport", "/attractions", "/about", "/help", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return locales.flatMap((lang) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
