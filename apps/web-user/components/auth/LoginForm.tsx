"use client";

import { useEffect, useActionState, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { AuthDict } from "@/i18n/dictionaries";
import {
  requestOtpAction,
  verifyOtpAction,
  type OtpState,
  type VerifyState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm({
  locale,
  next,
  dict,
}: {
  locale: Locale;
  next: string;
  dict: AuthDict;
}) {
  const [email, setEmail] = useState("");
  const [otpState, requestAction, sending] = useActionState<OtpState, FormData>(
    requestOtpAction,
    { ok: false },
  );
  const [verifyState, verifyAction, verifying] = useActionState<
    VerifyState,
    FormData
  >(verifyOtpAction, {});

  // Yangi foydalanuvchi — profil to'ldirish sahifasiga yo'naltirish
  useEffect(() => {
    if (verifyState.needsProfile && verifyState.locale) {
      const target = `/${verifyState.locale}/register?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`;
      window.location.href = target;
    }
  }, [verifyState.needsProfile, verifyState.locale, email, next]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      {!otpState.ok ? (
        <form action={requestAction} className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{dict.title}</h1>
            <p className="text-sm text-slate-500">{dict.subtitle}</p>
          </header>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{dict.email}</span>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.emailPlaceholder}
            />
          </label>
          {otpState.error && (
            <p className="text-sm text-red-600">{dict.error}</p>
          )}
          <Button type="submit" size="lg" loading={sending}>
            {dict.sendCode}
          </Button>

          <p className="text-center text-sm text-slate-500">
            {dict.noAccount}{" "}
            <Link
              href={`/${locale}/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {dict.register}
            </Link>
          </p>
        </form>
      ) : (
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

          <input type="hidden" name="email" value={email} />
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
            {dict.verify}
          </Button>
        </form>
      )}
    </div>
  );
}
