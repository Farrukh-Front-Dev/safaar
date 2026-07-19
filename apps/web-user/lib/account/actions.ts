"use server";

import { redirect } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/i18n/config";

export interface ProfileState {
  ok: boolean;
  error?: string;
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const rawLocale = String(formData.get("locale") ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const input = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  };

  try {
    await api.users.updateProfile(input, { token: session.accessToken });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  return { ok: true };
}
