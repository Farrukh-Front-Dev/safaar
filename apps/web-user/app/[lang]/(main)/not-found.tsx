import Link from "next/link";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";

/**
 * 404 — Sahifa topilmadi.
 *
 * Eslatma: Next.js `not-found.tsx` ga route `params` uzatmaydi (u maxsus
 * fayl), shuning uchun joriy `lang` ni bu yerda bilib bo'lmaydi. Til bo'yicha
 * lug'atni `defaultLocale` ("uz") asosida olamiz.
 */
export default async function NotFound() {
  const dict = await getDictionary(defaultLocale, "errors");
  const { notFound } = dict;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="text-7xl font-bold tracking-tight text-primary-600 sm:text-8xl">
        {notFound.code}
      </p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {notFound.title}
      </h1>
      <p className="text-slate-600 dark:text-slate-400">{notFound.text}</p>
      <Link href="/">
        <Button size="lg">{notFound.home}</Button>
      </Link>
    </main>
  );
}
