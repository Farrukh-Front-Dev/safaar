"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../../../../_components/ui/button";
import { Dialog } from "../../../../_components/ui/dialog";
import { Input } from "../../../../_components/ui/input";
import { Label } from "../../../../_components/ui/label";
import { useDataStore } from "../../../../_stores/data-store";
import type { Room } from "../../../../_lib/domain/types";

const schema = z.object({
  number: z
    .string()
    .min(1, "Raqamni kiriting")
    .regex(/^[0-9]+$/, "Faqat raqamlar"),
  floor: z.number().int().min(1).max(50),
  roomTypeId: z.string().min(1, "Xona turini tanlang"),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Room | null;
}

export function RoomDialog({ open, onClose, editing }: Props) {
  const roomTypes = useDataStore((s) => s.roomTypes);
  const addRoom = useDataStore((s) => s.addRoom);
  const updateRoom = useDataStore((s) => s.updateRoom);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: "",
      floor: 1,
      roomTypeId: roomTypes[0]?.id ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              number: editing.number,
              floor: editing.floor,
              roomTypeId: editing.roomTypeId,
            }
          : {
              number: "",
              floor: 1,
              roomTypeId: roomTypes[0]?.id ?? "",
            },
      );
    }
  }, [open, editing, form, roomTypes]);

  const onSubmit = form.handleSubmit((values) => {
    if (editing) {
      const result = updateRoom(editing.id, values);
      if (!result.ok) {
        toast.error(result.reason ?? "Tahrirlab bo'lmadi");
        return;
      }
      toast.success(`Xona ${values.number} yangilandi`);
    } else {
      const result = addRoom(values);
      if (!result.ok) {
        toast.error(result.reason ?? "Qo'shib bo'lmadi");
        return;
      }
      toast.success(`Xona ${values.number} qo'shildi`);
    }
    onClose();
  });

  const err = form.formState.errors;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? `Xona ${editing.number}` : "Yangi xona"}
      description={
        editing
          ? "Xona ma'lumotlarini tahrirlash"
          : "Mehmonxonangizga yangi xona qo'shish"
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-number">Xona raqami</Label>
            <Input
              id="r-number"
              placeholder="101"
              inputMode="numeric"
              aria-invalid={Boolean(err.number)}
              {...form.register("number")}
            />
            {err.number && (
              <p className="text-xs text-red-600">{err.number.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-floor">Qavat</Label>
            <Input
              id="r-floor"
              type="number"
              min={1}
              max={50}
              {...form.register("floor", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="r-type">Xona turi</Label>
            <select
              id="r-type"
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
            {err.roomTypeId && (
              <p className="text-xs text-red-600">{err.roomTypeId.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={roomTypes.length === 0}>
            {editing ? "Saqlash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
