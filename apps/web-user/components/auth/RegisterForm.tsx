"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { AuthDict } from "@/i18n/dictionaries";
import {
  requestOtpAction,
  verifyOtpAction,
  completeProfileAction,
  type OtpState,
  type VerifyState,
  type CompleteProfileState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm({
  locale,
  next,
  dict,
}: {
  locale: Locale;
  next: string;
  dict: AuthDict;
}) {
  const [phone, setPhone] = useState("");
  const [otpState, requestAction, sending] = useActionState<OtpState, FormData>(
    requestOtpAction,
    { ok: false },
  );
  const [verifyState, verifyAction, verifying] = useActionState<
    VerifyState,
    FormData
  >(verifyOtpAction, {});
  const [profileState, profileAction, saving] = useActionState<
    CompleteProfileState,
    FormData
  >(completeProfileAction, {});

  // OTP tasdiqlangandan keyin profil to'ldirish bosqichi
  const showProfile = verifyState.needsProfile || otpState.ok === false;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      {!otpState.ok && !verifyState.needsProfile && (
        <form action={requestAction} className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{dict.registerTitle}</h1>
            <p className="text-sm text-slate-500">{dict.registerSubtitle}</p>
          </header>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{dict.phone}</span>
            <Input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={dict.phonePlaceholder}
            />
          </label>
          {otpState.error && (
            <p className="text-sm text-red-600">{dict.error}</p>
          )}
          <Button type="submit" size="lg" loading={sending}>
            {dict.sendCode}
          </Button>

          <p className="text-center text-sm text-slate-500">
            {dict.hasAccount}{" "}
            <Link
              href={`/${locale}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {dict.login}
            </Link>
          </p>
        </form>
      )}

      {otpState.ok && !verifyState.needsProfile && (
        <form action={verifyAction} className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{dict.codeTitle}</h1>
            <p className="text-sm text-slate-500">{dict.codeSubtitle}</p>
          </header>

          {otpState.devCode && (
            <p className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-800">
              {dict.devCode}: <strong>{otpState.devCode}</strong>
            </p>
          )}

          <input type="hidden" name="phone" value={phone} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={next} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{dict.code}</span>
            <Input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              placeholder="••••••"
            />
          </label>

          {verifyState.error && (
            <p className="text-sm text-red-600">{dict.error}</p>
          )}

          <Button type="submit" size="lg" loading={verifying}>
            {dict.verifyAndRegister}
          </Button>
        </form>
      )}

      {verifyState.needsProfile && (
        <form action={profileAction} className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{dict.completeProfileTitle}</h1>
            <p className="text-sm text-slate-500">{dict.completeProfileSubtitle}</p>
          </header>

          <input type="hidden" name="locale" value={locale} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{dict.firstName}</span>
            <Input
              name="firstName"
              required
              placeholder={dict.firstNamePlaceholder}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{dict.lastName}</span>
            <Input
              name="lastName"
              placeholder={dict.lastNamePlaceholder}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{dict.email}</span>
            <Input
              name="email"
              type="email"
              placeholder={dict.emailPlaceholder}
            />
          </label>

          {profileState.error && (
            <p className="text-sm text-red-600">
              {profileState.error === "FIRST_NAME_REQUIRED" ? dict.firstNameRequired : dict.error}
            </p>
          )}

          <Button type="submit" size="lg" loading={saving}>
            {dict.save}
          </Button>
        </form>
      )}
    </div>
  );
}
