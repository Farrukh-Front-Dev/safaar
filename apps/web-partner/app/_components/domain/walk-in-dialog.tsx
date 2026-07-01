"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TODAY_ISO } from "../../_lib/mocks/data";
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

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface WalkInInitial {
  checkIn?: string;
  checkOut?: string;
  roomTypeId?: string;
}

interface WalkInDialogProps {
  open: boolean;
  onClose: () => void;
  /** Kalendar'dan kelganda — oldindan to'ldirish. */
  initialValues?: WalkInInitial;
}

export function WalkInDialog({
  open,
  onClose,
  initialValues,
}: WalkInDialogProps) {
  const roomTypes = useDataStore((s) => s.roomTypes);
  const addReservation = useDataStore((s) => s.addReservation);
  const [submitting, setSubmitting] = useState(false);

  const defaultCheckIn = initialValues?.checkIn ?? TODAY_ISO;
  const defaultCheckOut =
    initialValues?.checkOut ?? addDaysIso(defaultCheckIn, 1);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "+998 ",
      roomTypeId: initialValues?.roomTypeId ?? roomTypes[0]?.id ?? "",
      checkIn: defaultCheckIn,
      checkOut: defaultCheckOut,
      adults: 2,
      children: 0,
    },
  });

  // Dialog ochilganda formani initial qiymatlar bilan yangilash
  useEffect(() => {
    if (open) {
      const ci = initialValues?.checkIn ?? TODAY_ISO;
      form.reset({
        fullName: "",
        phone: "+998 ",
        roomTypeId: initialValues?.roomTypeId ?? roomTypes[0]?.id ?? "",
        checkIn: ci,
        checkOut: initialValues?.checkOut ?? addDaysIso(ci, 1),
        adults: 2,
        children: 0,
      });
    }
  }, [open, initialValues, form, roomTypes]);

  const onSubmit = form.handleSubmit((values) => {
    setSubmitting(true);
    try {
      const roomType =
        roomTypes.find((rt) => rt.id === values.roomTypeId) ?? roomTypes[0];
      if (!roomType) {
        toast.error("Avval xona turi yarating");
        return;
      }
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

      toast.success(`Bron yaratildi: ${created.id}`);
      form.reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  });

  const err = form.formState.errors;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Yangi bron yaratish"
      description="Resepsiyonga to'g'ridan-to'g'ri kelgan mehmon uchun."
      size="lg"
    >
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="fullName">Mehmon FIO</Label>
          <Input
            id="fullName"
            placeholder="Aliyev Sherzod"
            aria-invalid={Boolean(err.fullName)}
            {...form.register("fullName")}
          />
          {err.fullName && (
            <p className="text-xs text-red-600">{err.fullName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            aria-invalid={Boolean(err.phone)}
            {...form.register("phone", {
              onChange: (e) => {
                e.target.value = maskPhone(e.target.value);
              },
            })}
          />
          {err.phone && (
            <p className="text-xs text-red-600">{err.phone.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="roomTypeId">Xona turi</Label>
          <select
            id="roomTypeId"
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:border-brand-600 focus:outline-none"
            {...form.register("roomTypeId")}
          >
            {roomTypes.length === 0 ? (
              <option value="">Avval xona turini yarating</option>
            ) : (
              roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} — {rt.basePrice.toLocaleString("uz-UZ")} so&apos;m
                </option>
              ))
            )}
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
          <Button type="submit" disabled={submitting} loading={submitting}>
            Bron yaratish
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
