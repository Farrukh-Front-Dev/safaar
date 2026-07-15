import { redirect } from "next/navigation";

export default async function ResortsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/hotels?type=resort`);
}
