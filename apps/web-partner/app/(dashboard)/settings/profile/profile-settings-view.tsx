"use client";

import { Save, ShieldCheck, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../../_components/ui/card";
import { Button } from "../../../_components/ui/button";
import { Input } from "../../../_components/ui/input";
import { Label } from "../../../_components/ui/label";
import { useAuthStore } from "../../../_stores/auth-store";
import { formatPhone } from "../../../_lib/utils/format";
import { isValidPhone, maskPhone, normalizePhone } from "../../../_lib/utils/phone";

const schema = z.object({
  fullName: z.string().min(2, "Ism kamida 2 belgi bo'lishi kerak"),
  phone: z.string().min(1, "Telefon raqamni kiriting").refine(isValidPhone, "Telefon noto'g'ri formatda"),
});

type Values = z.infer<typeof schema>;

export function ProfileSettingsView() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ? formatPhone(user.phone) : "+998 ",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateUser({
      fullName: values.fullName,
      phone: normalizePhone(values.phone),
    });
    toast.success("Profil ma'lumotlari saqlandi");
    form.reset(values);
  });

  if (!user) {
    return null;
  }

  const err = form.formState.errors;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Ism familiya</Label>
              <Input
                id="fullName"
                aria-invalid={Boolean(err.fullName)}
                {...form.register("fullName")}
              />
              {err.fullName ? (
                <p className="text-xs text-red-600">{err.fullName.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Access telefoni</Label>
              <Input
                id="phone"
                type="tel"
                aria-invalid={Boolean(err.phone)}
                {...form.register("phone", {
                  onChange: (event) => {
                    event.target.value = maskPhone(event.target.value);
                  },
                })}
              />
              {err.phone ? (
                <p className="text-xs text-red-600">{err.phone.message}</p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={!form.formState.isDirty}>
                <Save className="h-4 w-4" aria-hidden />
                Saqlash
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Access holati</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Bu profil admin tomonidan tasdiqlangan telefon raqam orqali ishlaydi.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <Smartphone className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Kirish usuli</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                SMS kod talab qilinmaydi. Tasdiqlangan telefon raqam bilan kiriladi.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
