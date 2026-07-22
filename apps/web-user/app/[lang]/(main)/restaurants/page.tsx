import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { RestaurantsView } from "@/components/catalog/RestaurantsView";

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
    title: `${commonDict.nav.restaurants} — Safaar`,
    description: catalogDict.restaurants.subtitle,
  };
}

export default async function RestaurantsPage({
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
      <RestaurantsView dict={catalogDict.restaurants} />
    </main>
  );
}
