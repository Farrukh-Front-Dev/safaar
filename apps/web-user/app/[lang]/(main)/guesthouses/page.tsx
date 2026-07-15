import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AccommodationPage } from "@/components/accommodation/AccommodationPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const common = await getDictionary(lang, "common");
  return { title: common.nav.guesthouses };
}

export default async function GuesthousesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const common = await getDictionary(lang, "common");
  const locale = lang;

  return (
    <AccommodationPage
      locale={locale}
      searchParams={await searchParams}
      basePath={`/${locale}/guesthouses`}
      title={common.nav.guesthouses}
    />
  );
}
