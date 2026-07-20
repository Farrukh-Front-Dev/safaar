"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SocialCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    router.replace(next);
  }, [router, next]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Kirish tasdiqlanmoqda...</p>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Kirish tasdiqlanmoqda...</p>
        </div>
      }
    >
      <SocialCallbackInner />
    </Suspense>
  );
}
