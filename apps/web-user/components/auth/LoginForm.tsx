"use client";

import { useActionState, useState } from "react";
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
  const [phone, setPhone] = useState("");
  const [otpState, requestAction, sending] = useActionState<OtpState, FormData>(
    requestOtpAction,
    { ok: false },
  );
  const [verifyState, verifyAction, verifying] = useActionState<
    VerifyState,
    FormData
  >(verifyOtpAction, {});

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      {!otpState.ok ? (
        <form action={requestAction} className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{dict.title}</h1>
            <p className="text-sm text-zinc-500">{dict.subtitle}</p>
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
          <Button type="submit" size="lg" disabled={sending}>
            {dict.sendCode}
          </Button>
        </form>
      ) : (
        <form action={verifyAction} className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{dict.codeTitle}</h1>
            <p className="text-sm text-zinc-500">{dict.codeSubtitle}</p>
          </header>

          {otpState.devCode && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
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

          <Button type="submit" size="lg" disabled={verifying}>
            {dict.verify}
          </Button>
        </form>
      )}
    </div>
  );
}
