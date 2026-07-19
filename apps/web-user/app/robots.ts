import type { MetadataRoute } from "next";

import { config } from "@/lib/config";

const SITE_URL = config.siteUrl;

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
