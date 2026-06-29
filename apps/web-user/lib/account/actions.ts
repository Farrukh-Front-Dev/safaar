"use server";

import { redirect } from "next/navigation";
import { ApiRequestError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { updateProfile } from "@/lib/api/users";
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
    await updateProfile(session, input);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  return { ok: true };
}
