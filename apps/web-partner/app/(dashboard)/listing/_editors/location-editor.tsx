"use client";

import { MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../_components/ui/button";
import { Drawer } from "../../../_components/ui/drawer";
import { EmptyState } from "../../../_components/ui/empty-state";
import { Input } from "../../../_components/ui/input";
import { Label } from "../../../_components/ui/label";
import { Tooltip } from "../../../_components/ui/tooltip";
import { useListing } from "../../../_hooks/use-listing";
import { useDataStore } from "../../../_stores/data-store";

export function LocationEditor({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data } = useListing();
  const addNearby = useDataStore((s) => s.addNearby);
  const removeNearby = useDataStore((s) => s.removeNearby);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Joy nomini kiriting");
      return;
    }
    if (!/^\d+[.,]?\d*\s*(m|km)$/i.test(distance.trim())) {
      toast.error("Masofa noto'g'ri. Masalan: 500 m yoki 12 km");
      return;
    }
    addNearby(name.trim(), distance.trim());
    setName("");
    setDistance("");
    toast.success("Qo'shildi");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Joylashuv"
      description="Manzil va yaqin diqqatga sazovor joylar."
      size="lg"
      footer={<Button onClick={onClose}>Yopish</Button>}
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Shahar</Label>
            <Input value={data.city} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Manzil</Label>
            <Input value={data.address} disabled />
            <p className="text-xs text-[var(--muted-foreground)]">
              Manzilni Sozlamalar → Mehmonxona bo'limidan o'zgartiring.
            </p>
          </div>
        </div>

        <div className="h-px bg-[var(--border)]" />

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold">
              Yaqin diqqatga sazovor joylar
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Aeroport, muzey, restoran va h.k. — 3-5 ta joy tavsiya qilinadi.
            </p>
          </div>

          <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
            <Input
              placeholder="Registon maydoni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Joy nomi"
            />
            <Input
              placeholder="500 m"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              aria-label="Masofa"
            />
            <Button type="submit">
              <Plus className="h-4 w-4" aria-hidden />
              Qo'shish
            </Button>
          </form>

          {data.nearby.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-8 w-8" aria-hidden />}
              title="Hozircha hech narsa yo'q"
              description="Yaqin diqqatga sazovor joylarni qo'shing."
            />
          ) : (
            <ul className="divide-y divide-[var(--border)] rounded-card border border-[var(--border)]">
              {data.nearby.map((place) => (
                <li
                  key={place.id}
                  className="flex items-center justify-between gap-2 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <MapPin
                      className="h-4 w-4 text-brand-700 dark:text-brand-300"
                      aria-hidden
                    />
                    <span className="font-medium">{place.name}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {place.distance}
                    </span>
                  </div>
                  <Tooltip content="O'chirish">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        removeNearby(place.id);
                        toast.success("O'chirildi");
                      }}
                      aria-label="O'chirish"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
