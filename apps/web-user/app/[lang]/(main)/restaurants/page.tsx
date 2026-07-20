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
  const dict = await getDictionary(lang as Locale, "common");
  return {
    title: `${dict.nav.restaurants} — Safaar`,
    description: "O'zbekiston bo'ylab eng yaxshi restoranlar, milliy oshxonalar va choyxonalar.",
  };
}

export default async function RestaurantsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <RestaurantsView />
    </main>
  );
}
