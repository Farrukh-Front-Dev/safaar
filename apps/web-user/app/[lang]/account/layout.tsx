import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const session = await getSession();
  if (!session) {
    redirect(
      `/${locale}/login?next=${encodeURIComponent(`/${locale}/account`)}`,
    );
  }

  const dict = await getDictionary(locale, "account");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>
      <AccountNav locale={locale} dict={dict.nav} />
      <div className="flex flex-col gap-4">{children}</div>
    </main>
  );
}
