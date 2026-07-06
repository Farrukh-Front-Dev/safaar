"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Button } from "../../_components/ui/button";
import { Input } from "../../_components/ui/input";
import { Label } from "../../_components/ui/label";
import { usePartnerPhoneLogin } from "../../_hooks/use-auth";
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

type PhoneValues = z.infer<typeof phoneSchema>;

export function LoginForm() {
  const phoneLogin = usePartnerPhoneLogin();
  const form = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "+998 " },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await phoneLogin.mutateAsync(normalizePhone(values.phone)).catch(() => null);
  });

  return (
    <form
      className="flex flex-col gap-4 fade-in"
      onSubmit={onSubmit}
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
            aria-invalid={Boolean(form.formState.errors.phone)}
            aria-describedby="phone-help phone-error"
            {...form.register("phone", {
              onChange: (e) => {
                e.target.value = maskPhone(e.target.value);
              },
            })}
          />
        </div>
        <p id="phone-help" className="text-xs text-[var(--muted-foreground)]">
          SMS kod shart emas. Admin tasdiqlagan raqam bilan darhol kirasiz.
        </p>
        {form.formState.errors.phone && (
          <p id="phone-error" role="alert" className="text-xs text-red-600">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        loading={phoneLogin.isPending}
        className="mt-2"
      >
        Kirish
      </Button>
    </form>
  );
}
