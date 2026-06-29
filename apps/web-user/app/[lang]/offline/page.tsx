import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";

/** `/uz/offline`, `/ru/offline`, `/en/offline` — oldindan generatsiya. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Offline sahifa — service worker tarmoq yo'q paytda shu sahifani ko'rsatadi.
 */
export default async function OfflinePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const dict = await getDictionary(locale, "errors");
  const { offline, notFound: nf } = dict;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
        {offline.title}
      </h1>
      <p className="text-slate-600 dark:text-slate-400">{offline.text}</p>
      <Link href={`/${locale}`}>
        <Button size="lg">{nf.home}</Button>
      </Link>
    </main>
  );
}
