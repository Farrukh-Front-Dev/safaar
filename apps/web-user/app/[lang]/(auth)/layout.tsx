import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { BackButton } from "@/components/ui/BackButton";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/**
 * Auth layout — navbar/footer yo'q.
 * Faqat logo (bosh sahifaga qaytish) + til almashtirgich.
 * Focused auth experience — user faqat kirishga diqqat qiladi.
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "uz") as Locale;
  const common = await getDictionary(locale, "common");

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <Link
            href={`/${locale}`}
            className="text-lg font-bold text-slate-900 transition-colors hover:text-primary-600"
          >
            {common.brand}
          </Link>
        </div>
        <LocaleSwitcher current={locale} />
      </header>

      {/* Auth content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
