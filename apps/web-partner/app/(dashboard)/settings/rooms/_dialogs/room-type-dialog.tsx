"use client";

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
import type { RoomType } from "../../../../_lib/domain/types";

const AMENITY_OPTIONS = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "tv", label: "TV" },
  { value: "ac", label: "Konditsioner" },
  { value: "minibar", label: "Mini bar" },
  { value: "balcony", label: "Balkon" },
  { value: "kitchen", label: "Oshxona" },
  { value: "parking", label: "Parking" },
  { value: "breakfast", label: "Nonushta" },
  { value: "pool", label: "Hovuz" },
  { value: "spa", label: "Spa" },
  { value: "gym", label: "Sport zal" },
];

const schema = z.object({
  name: z.string().min(2, "Nom kamida 2 belgi"),
  basePrice: z.number().min(0, "Narx 0 dan kichik bo'lmasin"),
  capacity: z.number().int().min(1).max(10),
  amenities: z.array(z.string()),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: RoomType | null;
}

export function RoomTypeDialog({ open, onClose, editing }: Props) {
  const addRoomType = useDataStore((s) => s.addRoomType);
  const updateRoomType = useDataStore((s) => s.updateRoomType);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      basePrice: 400_000,
      capacity: 2,
      amenities: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              name: editing.name,
              basePrice: editing.basePrice,
              capacity: editing.capacity,
              amenities: editing.amenities,
            }
          : {
              name: "",
              basePrice: 400_000,
              capacity: 2,
              amenities: [],
            },
      );
    }
  }, [open, editing, form]);

  const selectedAmenities =
    useWatch({ control: form.control, name: "amenities" }) ?? [];

  const toggleAmenity = (value: string) => {
    const current = form.getValues("amenities");
    if (current.includes(value)) {
      form.setValue(
        "amenities",
        current.filter((a) => a !== value),
      );
    } else {
      form.setValue("amenities", [...current, value]);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    if (editing) {
      updateRoomType(editing.id, values);
      toast.success(`"${values.name}" yangilandi`);
    } else {
      addRoomType(values);
      toast.success(`"${values.name}" qo'shildi`);
    }
    onClose();
  });

  const err = form.formState.errors;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Xona turini tahrirlash" : "Yangi xona turi"}
      description="Masalan: Standart, Lyuks, Family Suite"
      size="lg"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rt-name">Nomi</Label>
            <Input
              id="rt-name"
              placeholder="Standart"
              aria-invalid={Boolean(err.name)}
              {...form.register("name")}
            />
            {err.name && (
              <p className="text-xs text-red-600">{err.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rt-capacity">Sig'imi (necha kishi)</Label>
            <Input
              id="rt-capacity"
              type="number"
              min={1}
              max={10}
              {...form.register("capacity", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="rt-price">Bir kechalik narx (so'm)</Label>
            <Input
              id="rt-price"
              type="number"
              min={0}
              step={10000}
              placeholder="400000"
              {...form.register("basePrice", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Qulayliklar</Label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => {
              const checked = selectedAmenities.includes(a.value);
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => toggleAmenity(a.value)}
                  aria-pressed={checked}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    checked
                      ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                      : "border-[var(--border)] bg-[var(--surface)] text-zinc-600 hover:bg-[var(--surface-muted)] dark:text-zinc-300"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit">{editing ? "Saqlash" : "Qo'shish"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
