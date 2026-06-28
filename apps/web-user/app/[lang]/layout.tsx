import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

// Tana/UI — Inter; sarlavha — Manrope. Ikkalasi uz/ru/en (lotin + lotin-ext +
// kirill) glyphlarini to'liq qoplaydi.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UzBron — Mehmonxona va avtobus bron qilish",
  description:
    "O'zbekiston bo'ylab mehmonxona va avtobuslarni onlayn bron qiling.",
  manifest: "/manifest.webmanifest",
  applicationName: "UzBron",
  appleWebApp: {
    capable: true,
    title: "UzBron",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

/** `/uz`, `/ru`, `/en` — tillarni oldindan generatsiya qilamiz. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const common = await getDictionary(locale, "common");
  const session = await getSession();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <SiteHeader locale={locale} dict={common} authed={!!session} />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter locale={locale} dict={common} />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
