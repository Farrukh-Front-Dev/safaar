"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { Button } from "../../_components/ui/button";
import { Input } from "../../_components/ui/input";
import { Label } from "../../_components/ui/label";
import { Spinner } from "../../_components/ui/spinner";
import { useRequestOtp, useVerifyOtp } from "../../_hooks/use-auth";
import {
  isValidPhone,
  maskPhone,
  normalizePhone,
} from "../../_lib/utils/phone";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Telefon raqamni kiriting")
    .refine(isValidPhone, "Telefon noto'g'ri formatda"),
});

const otpSchema = z.object({
  code: z
    .string()
    .min(1, "Kodni kiriting")
    .regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
});

type PhoneValues = z.infer<typeof phoneSchema>;
type OtpValues = z.infer<typeof otpSchema>;

const RESEND_AFTER_SECONDS = 60;

export function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "+998 " },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  // Taymer: qayta yuborish uchun qoldiq sekundlar
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const onPhoneSubmit = phoneForm.handleSubmit(async (values) => {
    const normalized = normalizePhone(values.phone);
    // mutateAsync xato bersa, toast `onError` orqali chiqadi.
    // Promise'ni shu yerda ushlaymiz — aks holda Next.js dev overlay'i otadi.
    const result = await requestOtp.mutateAsync(normalized).catch(() => null);
    if (!result) return;
    setPhone(normalized);
    setStep("otp");
    setSecondsLeft(RESEND_AFTER_SECONDS);
    otpForm.reset();
  });

  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    await verifyOtp.mutateAsync({ phone, code: values.code }).catch(() => null);
  });

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    const result = await requestOtp.mutateAsync(phone).catch(() => null);
    if (result) setSecondsLeft(RESEND_AFTER_SECONDS);
  };

  if (step === "phone") {
    return (
      <form
        className="flex flex-col gap-4 fade-in"
        onSubmit={onPhoneSubmit}
        aria-label="Telefon raqam bilan kirish"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Telefon raqam</Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+998 90 123 45 67"
              className="pl-9"
              aria-invalid={Boolean(phoneForm.formState.errors.phone)}
              aria-describedby="phone-help phone-error"
              {...phoneForm.register("phone", {
                onChange: (e) => {
                  e.target.value = maskPhone(e.target.value);
                },
              })}
            />
          </div>
          <p id="phone-help" className="text-xs text-[var(--muted-foreground)]">
            Bu raqamga 6 xonali SMS kod yuboriladi.
          </p>
          {phoneForm.formState.errors.phone && (
            <p id="phone-error" role="alert" className="text-xs text-red-600">
              {phoneForm.formState.errors.phone.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={requestOtp.isPending}
          className="mt-2"
        >
          {requestOtp.isPending ? (
            <>
              <Spinner size="sm" />
              Yuborilmoqda...
            </>
          ) : (
            "Kod yuborish"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 fade-in"
      onSubmit={onOtpSubmit}
      aria-label="SMS kodni tasdiqlash"
      noValidate
    >
      <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm dark:bg-brand-900/30">
        <ShieldCheck
          className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-300"
          aria-hidden
        />
        <p className="text-brand-800 dark:text-brand-200">
          Kod yuborildi: <span className="font-semibold">{maskPhone(phone)}</span>
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">SMS kod</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="······"
          className="text-center text-lg tracking-[0.5em] font-semibold"
          aria-invalid={Boolean(otpForm.formState.errors.code)}
          aria-describedby="code-help code-error"
          autoFocus
          {...otpForm.register("code", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
            },
          })}
        />
        <p id="code-help" className="text-xs text-[var(--muted-foreground)]">
          6 ta raqamni kiriting.
        </p>
        {otpForm.formState.errors.code && (
          <p id="code-error" role="alert" className="text-xs text-red-600">
            {otpForm.formState.errors.code.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="inline-flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Raqamni o'zgartirish
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || requestOtp.isPending}
          className="font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline dark:text-brand-300"
        >
          {secondsLeft > 0
            ? `Qayta yuborish (${secondsLeft}s)`
            : "Kodni qayta yuborish"}
        </button>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={verifyOtp.isPending}
        className="mt-1"
      >
        {verifyOtp.isPending ? (
          <>
            <Spinner size="sm" />
            Tekshirilmoqda...
          </>
        ) : (
          "Tasdiqlash va kirish"
        )}
      </Button>
    </form>
  );
}
