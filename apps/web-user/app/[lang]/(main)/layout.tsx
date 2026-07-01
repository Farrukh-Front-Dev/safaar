import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PromoBar } from "@/components/layout/PromoBar";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Main layout — SiteHeader + PromoBar + Footer.
 * Barcha sahifalar (login'dan tashqari) shu layout ichida.
 */
export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "uz") as Locale;

  const common = await getDictionary(locale, "common");
  const session = await getSession();

  return (
    <>
      <PromoBar text={common.promo} />
      <SiteHeader locale={locale} dict={common} authed={!!session} />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter locale={locale} dict={common} />
    </>
  );
}
