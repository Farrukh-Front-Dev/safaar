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
  const common = await getDictionary(lang as Locale, "common");
  return {
    title: `${common.nav.attractions} — Safaar`,
    description: "O'zbekistonning tarixiy obidalari va diqqatga sazovor maskanlari.",
  };
}

export default async function AttractionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <AttractionsView />
    </main>
  );
}
