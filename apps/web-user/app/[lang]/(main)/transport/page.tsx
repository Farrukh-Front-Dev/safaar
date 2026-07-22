import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { TransportView } from "@/components/catalog/TransportView";

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
  const transportTitle = (commonDict.nav as typeof commonDict.nav & { transport?: string }).transport ?? "Transport";
  return {
    title: `${transportTitle} — Safaar`,
    description: catalogDict.transport.subtitle,
  };
}

export default async function TransportPage({
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
      <TransportView dict={catalogDict.transport} />
    </main>
  );
}
