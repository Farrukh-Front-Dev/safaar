"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buildPartnerSession } from "../_lib/auth/session";
import { mockDelay } from "../_lib/mocks/data";
import { useAuthStore } from "../_stores/auth-store";

// Demo rejim — backendsiz ishlaydi.
// Real API tayyor bo'lganda `mockDelay` o'rniga
// `requestOtp(phone)` va `verifyOtp({phone, code})` chaqiramiz.

export function useRequestOtp() {
  return useMutation({
    mutationFn: async (phone: string) => {
      // Demo rejim: real backend chaqirilmaydi
      void phone;
      await mockDelay({ sent: true });
      return { sent: true } as const;
    },
    onSuccess: () => {
      toast.success("Demo rejim: istalgan 6 raqamli kod ishlaydi");
    },
    onError: (error) => {
      toast.error(error.message || "Kod yuborishda xato yuz berdi");
    },
  });
}

export function useVerifyOtp() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      // Mock validatsiya: istalgan 6 raqam OK
      if (!/^\d{6}$/.test(code)) {
        throw new Error("Kod 6 ta raqamdan iborat bo'lishi kerak");
      }
      await mockDelay(null);
      const tokens = {
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
      };
      return { phone, tokens };
    },
    onSuccess: ({ phone, tokens }) => {
      const { user } = buildPartnerSession(phone, tokens);
      setSession(user, tokens);
      toast.success("Xush kelibsiz!");
      router.replace("/");
    },
    onError: (error) => {
      toast.error(error.message || "Kod noto'g'ri yoki muddati o'tgan");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return () => {
    clearSession();
    toast.success("Demo sessiya yangilandi");
    router.replace("/");
  };
}
