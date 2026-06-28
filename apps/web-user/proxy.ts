/**
 * Locale redirect (Next.js 16: `middleware` → `proxy`).
 *
 * URL'da til prefiksi bo'lmasa (`/hotels`), foydalanuvchi brauzeri tiliga qarab
 * mos tilga yo'naltiramiz (`/uz/hotels`). Tashqi kutubxonasiz — `Accept-Language`
 * headerini o'zimiz tahlil qilamiz.
 */
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@/i18n/config";

function pickLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  // "ru-RU,ru;q=0.9,en;q=0.8" → eng yuqori q bo'yicha tartiblangan tillar.
  const ordered = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ordered) {
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = pickLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // _next ichki yo'llari va fayllarni (kengaytmasi borlar) o'tkazib yuboramiz.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
