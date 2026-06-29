import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uzbron.uz";

/**
 * robots.txt — public sahifalarni indekslashga ruxsat, shaxsiy/auth
 * yo'llarini (kabinet, bron, kirish) taqiqlaydi.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/account", "/*/booking", "/*/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
