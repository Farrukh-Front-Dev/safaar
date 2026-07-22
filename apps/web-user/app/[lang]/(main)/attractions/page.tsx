import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AttractionsView } from "@/components/catalog/AttractionsView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const [commonDict, catalogDict] = await Promise.all([
    getDictionary(lang as Locale, "common"),
    getDictionary(lang as Locale, "catalog"),
  ]);
  return {
    title: `${commonDict.nav.attractions} — Safaar`,
    description: catalogDict.attractions.subtitle,
  };
}

export default async function AttractionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const catalogDict = await getDictionary(locale, "catalog");

  return (
    <main className="flex flex-1 flex-col">
      <AttractionsView dict={catalogDict.attractions} />
    </main>
  );
}
