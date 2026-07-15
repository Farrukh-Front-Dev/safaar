"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SocialCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    router.replace(next);
  }, [router, next]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">Kirish tasdiqlanmoqda...</p>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-slate-500">Kirish tasdiqlanmoqda...</p>
        </div>
      }
    >
      <SocialCallbackInner />
    </Suspense>
  );
}
