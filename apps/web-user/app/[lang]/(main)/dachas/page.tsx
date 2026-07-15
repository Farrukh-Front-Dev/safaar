import { redirect } from "next/navigation";

export default async function DachasPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/hotels?type=dacha`);
}
