import { Suspense } from "react";
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
      <Suspense fallback={<div className="mx-auto w-full max-w-6xl p-8 animate-pulse bg-slate-100 dark:bg-slate-900 rounded-2xl h-96 mt-6" />}>
        <TransportView dict={catalogDict.transport} />
      </Suspense>
    </main>
  );
}
