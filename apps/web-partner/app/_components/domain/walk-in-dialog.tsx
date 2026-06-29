"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { mockRoomTypes, TODAY_ISO } from "../../_lib/mocks/data";
import { useDataStore } from "../../_stores/data-store";
import {
  isValidPhone,
  maskPhone,
  normalizePhone,
} from "../../_lib/utils/phone";

const schema = z.object({
  fullName: z.string().min(2, "Ism kamida 2 belgi"),
  phone: z.string().refine(isValidPhone, "Telefon noto'g'ri"),
  roomTypeId: z.string().min(1, "Xona turini tanlang"),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.number().int().min(1).max(8),
  children: z.number().int().min(0).max(8),
});

type Values = z.infer<typeof schema>;

function nightsBetween(a: string, b: string): number {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)));
}

interface WalkInDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WalkInDialog({ open, onClose }: WalkInDialogProps) {
  const addReservation = useDataStore((s) => s.addReservation);
  const [submitting, setSubmitting] = useState(false);

  const today = TODAY_ISO;
  // Bir kun keyingisi (TODAY_ISO statik bo'lgani uchun render'da emas, modul'da hisoblanadi)
  const tomorrow = (() => {
    const d = new Date(TODAY_ISO);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "+998 ",
      roomTypeId: mockRoomTypes[0].id,
      checkIn: today,
      checkOut: tomorrow,
      adults: 2,
      children: 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSubmitting(true);
    try {
      const roomType =
        mockRoomTypes.find((rt) => rt.id === values.roomTypeId) ??
        mockRoomTypes[0];
      const nights = nightsBetween(values.checkIn, values.checkOut);
      const total = roomType.basePrice * nights;

      const created = addReservation({
        fullName: values.fullName,
        phone: normalizePhone(values.phone),
        roomTypeId: values.roomTypeId,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        adults: values.adults,
        children: values.children,
        nights,
        totalPrice: total,
      });

      toast.success(`Walk-in bron yaratildi: ${created.id}`);
      form.reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Walk-in bron"
      description="Resepsiyonga to'g'ridan-to'g'ri kelgan mehmon uchun bron yaratish."
      size="lg"
    >
      <form id="walk-in-form" onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="fullName">Mehmon FIO</Label>
          <Input
            id="fullName"
            placeholder="Aliyev Sherzod"
            aria-invalid={Boolean(form.formState.errors.fullName)}
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p className="text-xs text-red-600">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register("phone", {
              onChange: (e) => {
                e.target.value = maskPhone(e.target.value);
              },
            })}
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-red-600">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="roomTypeId">Xona turi</Label>
          <select
            id="roomTypeId"
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:border-brand-600 focus:outline-none"
            {...form.register("roomTypeId")}
          >
            {mockRoomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} — {rt.basePrice.toLocaleString("uz-UZ")} so&apos;m / kech.
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkIn">Kelish sanasi</Label>
          <Input id="checkIn" type="date" {...form.register("checkIn")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checkOut">Ketish sanasi</Label>
          <Input id="checkOut" type="date" {...form.register("checkOut")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="adults">Kattalar</Label>
          <Input
            id="adults"
            type="number"
            min={1}
            max={8}
            {...form.register("adults", { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="children">Bolalar</Label>
          <Input
            id="children"
            type="number"
            min={0}
            max={8}
            {...form.register("children", { valueAsNumber: true })}
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={submitting}>
            Bron yaratish
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
