import { redirect } from "next/navigation";

export default async function SanatoriumsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/hotels?type=sanatorium`);
}
