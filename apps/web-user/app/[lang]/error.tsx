"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/Button";
import uzErrors from "@/locales/uz/errors.json";
import ruErrors from "@/locales/ru/errors.json";
import enErrors from "@/locales/en/errors.json";

const errorsByLocale: Record<Locale, typeof uzErrors> = {
  uz: uzErrors,
  ru: ruErrors,
  en: enErrors,
};

/**
 * Route segment error boundary ('use client' majburiy).
 *
 * `error.tsx` ga ham `params` uzatilmaydi, shuning uchun joriy tilni
 * `usePathname` ning birinchi segmentidan aniqlaymiz.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale: Locale = isLocale(segment) ? segment : defaultLocale;
  const dict = errorsByLocale[locale].error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
        {dict.title}
      </h1>
      <p className="text-slate-600 dark:text-slate-400">{dict.text}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>
          {dict.retry}
        </Button>
        <Link href="/">
          <Button size="lg" variant="secondary">
            {dict.home}
          </Button>
        </Link>
      </div>
    </main>
  );
}
