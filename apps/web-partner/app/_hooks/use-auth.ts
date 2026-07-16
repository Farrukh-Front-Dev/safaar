"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { access } from "../_lib/api";
import { buildPartnerSession } from "../_lib/auth/session";
import { useAuthStore } from "../_stores/auth-store";

export function usePartnerPhoneLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (phone: string) => {
      try {
        const accessStatus = await access.getPartnerAccessStatus(phone);
        if (accessStatus.status !== "approved") {
          if (accessStatus.status === "rejected") {
            throw new Error("Arizangiz rad etilgan. Admin bilan bog'laning.");
          }
          if (accessStatus.status === "new" || accessStatus.status === "reviewing" || accessStatus.status === "submitted") {
            throw new Error("Arizangiz hali admin tomonidan tasdiqlanmagan.");
          }
          throw new Error("Bu telefon uchun hamkorlik access topilmadi. Avval ariza yuboring.");
        }
        const tokens = {
          accessToken: "demo-access-token",
          refreshToken: "demo-refresh-token",
        };
        const partnerType = accessStatus.request?.type || "hotel";
        return { phone, tokens, organizationId: accessStatus.request?.id || "demo-partner-org-id", partnerType };
      } catch (err: any) {
        if (err.name === "HttpError" && err.status === 0) {
          console.warn("Backend offline. Fallback to mock session.");
          const tokens = {
            accessToken: "demo-access-token",
            refreshToken: "demo-refresh-token",
          };
          return { phone, tokens, organizationId: "demo-partner-org-id", partnerType: "hotel" };
        }
        throw err;
      }
    },
    onSuccess: ({ phone, tokens, organizationId, partnerType }) => {
      const { user } = buildPartnerSession(phone, tokens, partnerType);
      user.organizationId = organizationId;
      setSession(user, tokens);
      toast.success("Xush kelibsiz!");
      router.replace("/");
    },
    onError: (error) => {
      toast.error(error.message || "Kirish uchun access topilmadi");
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
