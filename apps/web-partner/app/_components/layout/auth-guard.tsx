"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "../ui/spinner";
import { useMounted } from "../../_hooks/use-mounted";
import { useAuthStore } from "../../_stores/auth-store";

/**
 * Dashboard route'larini himoyalaydi.
 *
 * Client-side guard: zustand persist hydratsiyasini kutib, session yo'q
 * bo'lsa `/login`'ga yo'naltiradi.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useMounted();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Sahifa tayyorlanmoqda" />
      </div>
    );
  }

  return <>{children}</>;
}
