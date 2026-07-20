"use client";

import { Info, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../../../../_components/ui/button";
import { Dialog } from "../../../../_components/ui/dialog";
import { Input } from "../../../../_components/ui/input";
import { Label } from "../../../../_components/ui/label";
import { useDataStore } from "../../../../_stores/data-store";
import { useAuthStore } from "../../../../_stores/auth-store";
import { hasBeds } from "../../../../_lib/utils/partner-labels";

const schema = z.object({
  floor: z.number().int().min(1).max(50),
  startNumber: z.number().int().min(1).max(9999),
  count: z.number().int().min(1).max(200),
  roomTypeId: z.string().min(1, "Xona turini tanlang"),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BulkRoomsDialog({ open, onClose }: Props) {
  const roomTypes = useDataStore((s) => s.roomTypes);
  const bulkAddRooms = useDataStore((s) => s.bulkAddRooms);
  const generateBedsForRoom = useDataStore((s) => s.generateBedsForRoom);
  const partnerType = useAuthStore((s) => s.user?.partnerType);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      floor: 1,
      startNumber: 101,
      count: 10,
      roomTypeId: roomTypes[0]?.id ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        floor: 1,
        startNumber: 101,
        count: 10,
        roomTypeId: roomTypes[0]?.id ?? "",
      });
    }
  }, [open, form, roomTypes]);

  const values = useWatch({ control: form.control });
  const count = values.count ?? 0;
  const start = values.startNumber ?? 0;
  const previewNumbers = Array.from(
    { length: Math.min(count, 5) },
    (_, i) => start + i,
  );
  const showEllipsis = count > 5;
  const lastNumber = start + count - 1;

  const onSubmit = form.handleSubmit((v) => {
    const result = bulkAddRooms(v);
    if (!result.ok) {
      toast.error(result.reason ?? "Xato yuz berdi");
      return;
    }
    if (hasBeds(partnerType) && result.rooms) {
      const roomType = roomTypes.find((rt) => rt.id === v.roomTypeId);
      result.rooms.forEach((room) =>
        generateBedsForRoom(room.id, roomType?.capacity ?? 1),
      );
    }
    toast.success(`${result.added} ta xona qo'shildi`);
    if (result.reason) {
      toast.warning(result.reason);
    }
    onClose();
  });

  const err = form.formState.errors;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Ko'p xonani birdaniga qo'shish"
      description="Bir qavatdagi ketma-ket xonalarni tez yaratish."
      size="lg"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-floor">Qavat</Label>
            <Input
              id="bulk-floor"
              type="number"
              min={1}
              max={50}
              {...form.register("floor", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-start">Boshlanish raqami</Label>
            <Input
              id="bulk-start"
              type="number"
              min={1}
              max={9999}
              placeholder="101"
              {...form.register("startNumber", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-count">Soni</Label>
            <Input
              id="bulk-count"
              type="number"
              min={1}
              max={200}
              {...form.register("count", { valueAsNumber: true })}
            />
            {err.count && (
              <p className="text-xs text-red-600">{err.count.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bulk-type">Xona turi</Label>
          <select
            id="bulk-type"
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

        {/* Preview */}
        <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm dark:border-brand-900/50 dark:bg-brand-950/30">
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-300"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-brand-900 dark:text-brand-100">
              Yaratiladigan xonalar
            </p>
            <p className="text-brand-800 dark:text-brand-200">
              {previewNumbers.join(", ")}
              {showEllipsis && ", ..., "}
              {showEllipsis && lastNumber}
              {" — jami "}
              <strong>{values.count || 0} ta xona</strong>
            </p>
          </div>
        </div>

        {/* Conflict warning */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>
            Agar ba'zi raqamlar mavjud bo'lsa — ular avtomatik o'tkazib
            yuboriladi. Holat: barcha yangi xonalar "Toza & bo'sh".
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={roomTypes.length === 0}>
            Yaratish
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
