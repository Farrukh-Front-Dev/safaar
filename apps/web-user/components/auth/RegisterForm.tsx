"use client";

import { useActionState, useState, useMemo } from "react";
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

function passwordStrength(pw: string): { label: string; level: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "", level: 0, color: "bg-red-500" };
  if (score <= 3) return { label: "Zaif", level: 1, color: "bg-red-500" };
  if (score <= 4) return { label: "O'rtacha", level: 2, color: "bg-yellow-500" };
  return { label: "Kuchli", level: 3, color: "bg-green-500" };
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const strength = useMemo(() => passwordStrength(password), [password]);

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

  const action = verifyState.needsProfile ? profileAction : verifyAction;
  const loading = sending || verifying || saving;

  const errorMsg = otpState.error || verifyState.error || profileState.error;

  const passwordErrorMap: Record<string, string> = {
    PASSWORD_TOO_SHORT: dict.passwordTooShort,
    PASSWORD_NO_UPPERCASE: dict.passwordNoUppercase,
    PASSWORD_NO_LOWERCASE: dict.passwordNoLowercase,
    PASSWORD_NO_NUMBER: dict.passwordNoNumber,
    PASSWORD_NO_SPECIAL: dict.passwordNoSpecial,
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{dict.registerTitle}</h1>
        <p className="text-sm text-slate-500">{dict.registerSubtitle}</p>
      </header>

      <form action={action} className="flex flex-col gap-4">
        {/* Telefon + Send code — always visible */}
        <div className="flex items-end gap-2">
          <label className="flex flex-1 flex-col gap-1">
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
          <Button
            type="button"
            variant="secondary"
            size="md"
            loading={sending}
            disabled={otpState.ok && !otpState.error}
            formAction={requestAction}
          >
            {otpState.ok ? dict.codeSent : dict.sendCode}
          </Button>
        </div>

        {otpState.error && (
          <p className="-mt-2 text-sm text-red-600">{otpState.error === "PHONE_REQUIRED" ? dict.phone : dict.error}</p>
        )}

        {otpState.devCode && (
          <p className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-800">
            {dict.devCode}: <strong>{otpState.devCode}</strong>
          </p>
        )}

        {/* OTP input */}
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

        <hr className="border-slate-200" />

        {/* Profile fields */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {dict.firstName} <span className="text-red-500">*</span>
          </span>
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

        {/* Password */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{dict.password}</span>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={dict.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </label>

        {password && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= strength.level ? strength.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">{strength.label}</p>
          </div>
        )}

        {/* Password requirements checklist */}
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <p className="mb-1 font-medium">{dict.passwordRequirements}</p>
          <ul className="list-inside list-disc space-y-0.5">
            <li className={password.length >= 8 ? "text-green-600" : ""}>{dict.passwordMinChars}</li>
            <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>{dict.passwordUppercase}</li>
            <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>{dict.passwordLowercase}</li>
            <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>{dict.passwordNumber}</li>
            <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>{dict.passwordSpecial}</li>
          </ul>
        </div>

        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next} />

        {errorMsg && (
          <p className="text-sm text-red-600">
            {passwordErrorMap[errorMsg] ||
              (profileState.error === "FIRST_NAME_REQUIRED"
                ? dict.firstNameRequired
                : dict.error)}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading}>
          {dict.verifyAndRegister}
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
    </div>
  );
}
