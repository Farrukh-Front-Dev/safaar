import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const sp = await searchParams;
  const nextRaw = sp.next;
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/")
    ? nextRaw
    : "";

  // Allaqachon kirgan bo'lsa — qaytib login ko'rsatmaymiz.
  const session = await getSession();
  if (session) {
    redirect(next || `/${locale}`);
  }

  const dict = await getDictionary(locale, "auth");
  return <LoginForm locale={locale} next={next} dict={dict} />;
}
