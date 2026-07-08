"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "../_components/ui/spinner";
import { useAuthStore } from "../_stores/auth-store";

export default function LogoutPage() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    clearSession();
    localStorage.removeItem("uzbron-partner-auth");
    router.replace("/login");
  }, [clearSession, router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[var(--background)]"
      role="status"
      aria-label="Sessiya tozalanmoqda"
    >
      <Spinner size="lg" label="Sessiya tozalanmoqda" />
    </main>
  );
}
