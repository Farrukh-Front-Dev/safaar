import type { Metadata } from "next";
import {
  generateAccommodationMetadata,
  renderAccommodationRoute,
} from "@/components/features/accommodation/renderAccommodationRoute";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return generateAccommodationMetadata(lang, "hotels");
}

export default async function HotelsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  return renderAccommodationRoute(lang, await searchParams, "hotels");
}
