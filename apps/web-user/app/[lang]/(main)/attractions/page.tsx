import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const common = await getDictionary(lang, "common");
  return { title: common.nav.attractions };
}

export default async function AttractionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const common = await getDictionary(locale, "common");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-14 md:pt-32">
      <h1 className="text-3xl font-bold text-slate-900">
        {common.nav.attractions}
      </h1>
      <p className="mt-4 text-slate-600">
        Tez kunda...
      </p>
    </main>
  );
}
