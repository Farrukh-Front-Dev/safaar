"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMounted } from "../../_hooks/use-mounted";
import { useAuthStore } from "../../_stores/auth-store";
import { Spinner } from "../ui/spinner";

export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useMounted();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, pathname, router, user]);

  if (!hydrated || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--background)]"
        role="status"
        aria-label="Sahifa tayyorlanmoqda"
      >
        <Spinner size="lg" label="Sahifa tayyorlanmoqda" />
      </div>
    );
  }

  return <>{children}</>;
}
