"use client";

import { Save } from "lucide-react";
import { useState } from "react";
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
import { Input } from "../../../_components/ui/input";
import { Button } from "../../../_components/ui/button";
import { Label } from "../../../_components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Nom kamida 2 belgi"),
  inn: z.string().regex(/^\d{9}$/, "INN 9 raqamdan iborat bo'lishi kerak"),
  phone: z.string().min(7, "Telefon noto'g'ri"),
  email: z.string().email("Email noto'g'ri"),
  address: z.string().min(5, "Manzil juda qisqa"),
  description: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const DEFAULT: Values = {
  name: "Hotel Samarkand Plaza",
  inn: "304567890",
  phone: "+998 66 333 22 11",
  email: "reception@hotelsamarkand.uz",
  address: "Samarqand sh., Registon ko'chasi, 5",
  description:
    "Tarixiy Registan yaqinida joylashgan zamonaviy 4 yulduzli mehmonxona.",
};

export function HotelSettingsView() {
  const [saving, setSaving] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Ma'lumotlar saqlandi");
    form.reset(values);
    setSaving(false);
  });

  const err = form.formState.errors;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Asosiy ma'lumotlar</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Biznes nomi</Label>
              <Input
                id="name"
                aria-invalid={Boolean(err.name)}
                {...form.register("name")}
              />
              {err.name && (
                <p className="text-xs text-red-600">{err.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inn">INN</Label>
              <Input
                id="inn"
                aria-invalid={Boolean(err.inn)}
                {...form.register("inn")}
              />
              {err.inn && (
                <p className="text-xs text-red-600">{err.inn.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Aloqa telefoni</Label>
              <Input
                id="phone"
                type="tel"
                aria-invalid={Boolean(err.phone)}
                {...form.register("phone")}
              />
              {err.phone && (
                <p className="text-xs text-red-600">{err.phone.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={Boolean(err.email)}
                {...form.register("email")}
              />
              {err.email && (
                <p className="text-xs text-red-600">{err.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="address">Manzil</Label>
              <Input
                id="address"
                aria-invalid={Boolean(err.address)}
                {...form.register("address")}
              />
              {err.address && (
                <p className="text-xs text-red-600">{err.address.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="description">Tavsif (mijozlar uchun)</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Biznesingiz haqida qisqacha ma'lumot..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-brand-600 focus:outline-none"
                {...form.register("description")}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="submit" disabled={saving || !form.formState.isDirty}>
                <Save className="h-4 w-4" aria-hidden />
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
              {form.formState.isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => form.reset(DEFAULT)}
                >
                  Bekor qilish
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
