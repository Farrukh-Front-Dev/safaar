"use client";

import { useEffect, type ReactNode } from "react";
import { Role } from "@agoda/types";
import { useMounted } from "../../_hooks/use-mounted";
import { useAuthStore } from "../../_stores/auth-store";
import { Spinner } from "../ui/spinner";

const DEMO_USER = {
  id: "demo-staff",
  phone: "998901234567",
  fullName: "Resepsiyon Xodimi",
  role: Role.PARTNER,
};

const DEMO_TOKENS = {
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token",
};

/**
 * Demo rejim: kirish talab qilinmaydi.
 *
 * Sessiya yo'q bo'lsa (yangi qurilma, boshqa brauzer, incognito...),
 * default demo foydalanuvchi avtomatik tayinlanadi va dashboard darrov
 * ochiladi. `/login` sahifasi hali ham mavjud, lekin ixtiyoriy.
 *
 * Real auth (JWT middleware) tayyor bo'lganda bu komponentni
 * router.replace("/login") chaqirig'iga qaytaramiz.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const hydrated = useMounted();

  useEffect(() => {
    if (hydrated && !user) {
      setSession(DEMO_USER, DEMO_TOKENS);
    }
  }, [hydrated, user, setSession]);

  // Seeding bo'lguncha — toza loader (SSR'da ham server/client mos keladi).
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
