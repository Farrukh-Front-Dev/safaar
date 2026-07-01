"use client";

import { BedDouble, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { EmptyState } from "../ui/empty-state";
import { useDataStore } from "../../_stores/data-store";
import { useRooms } from "../../_hooks/use-rooms";
import { RoomStatus, type ReservationView } from "../../_lib/domain/types";
import { cn } from "../../_lib/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  reservation: ReservationView | null;
  /** Xona tanlangandan keyingi harakat. */
  onAssigned?: (roomNumber: string) => void;
}

export function AssignRoomDialog({
  open,
  onClose,
  reservation,
  onAssigned,
}: Props) {
  const { data: rooms } = useRooms();
  const assignRoom = useDataStore((s) => s.assignRoom);
  const [selected, setSelected] = useState<string | null>(null);

  // Faqat bo'sh (toza) va mos xona turidagi xonalar
  const availableRooms = useMemo(() => {
    if (!reservation) return [];
    return rooms.filter(
      (r) =>
        r.roomTypeId === reservation.roomTypeId &&
        r.status === RoomStatus.VACANT_CLEAN,
    );
  }, [rooms, reservation]);

  // Boshqa turdagi bo'sh xonalar (agar mos yo'q bo'lsa)
  const otherAvailable = useMemo(() => {
    if (!reservation) return [];
    return rooms.filter(
      (r) =>
        r.roomTypeId !== reservation.roomTypeId &&
        r.status === RoomStatus.VACANT_CLEAN,
    );
  }, [rooms, reservation]);

  const handleConfirm = () => {
    if (!reservation || !selected) return;
    assignRoom(reservation.id, selected);
    toast.success(`Xona ${selected} tayinlandi: ${reservation.guest.fullName}`);
    onAssigned?.(selected);
    setSelected(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      title="Xonaga tayinlash"
      description={
        reservation
          ? `${reservation.guest.fullName} · ${reservation.roomTypeName}`
          : ""
      }
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {availableRooms.length === 0 && otherAvailable.length === 0 ? (
          <EmptyState
            icon={<BedDouble className="h-10 w-10" aria-hidden />}
            title="Bo'sh xona yo'q"
            description="Barcha xonalar band yoki tozalanmoqda. Housekeeping'ni tekshiring."
          />
        ) : (
          <>
            {availableRooms.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                  Mos xonalar ({reservation?.roomTypeName})
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availableRooms.map((room) => (
                    <RoomOption
                      key={room.id}
                      number={room.number}
                      floor={room.floor}
                      selected={selected === room.number}
                      onSelect={() => setSelected(room.number)}
                    />
                  ))}
                </div>
              </div>
            )}

            {availableRooms.length === 0 && otherAvailable.length > 0 && (
              <>
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <p>
                    <strong>{reservation?.roomTypeName}</strong> turida bo'sh
                    xona yo'q. Boshqa turdagi xonalardan tanlashingiz mumkin
                    (upgrade).
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                    Boshqa bo'sh xonalar
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {otherAvailable.slice(0, 8).map((room) => (
                      <RoomOption
                        key={room.id}
                        number={room.number}
                        floor={room.floor}
                        typeName={room.roomTypeName}
                        selected={selected === room.number}
                        onSelect={() => setSelected(room.number)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={handleConfirm} disabled={!selected}>
            {selected ? `Xona ${selected} ga tayinlash` : "Xona tanlang"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function RoomOption({
  number,
  floor,
  typeName,
  selected,
  onSelect,
}: {
  number: string;
  floor: number;
  typeName?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200 dark:bg-brand-900/40 dark:ring-brand-800"
          : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]",
      )}
    >
      <span className="font-mono text-lg font-bold">{number}</span>
      <span className="text-[10px] text-[var(--muted-foreground)]">
        {floor}-qavat{typeName && ` · ${typeName}`}
      </span>
    </button>
  );
}
