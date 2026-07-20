"use client";

import { useEffect, useRef } from "react";
import { AssignBedDialog } from "./assign-bed-dialog";
import { AssignRoomDialog } from "./assign-room-dialog";
import { useAssignRoom } from "../../_hooks/use-reservations";
import { useAuthStore } from "../../_stores/auth-store";
import { useDataStore } from "../../_stores/data-store";
import { hasBeds, isDacha } from "../../_lib/utils/partner-labels";
import type { ReservationView } from "../../_lib/domain/types";

interface Props {
  open: boolean;
  onClose: () => void;
  reservation: ReservationView | null;
  onAssigned?: (roomNumber: string) => void;
}

/**
 * Check-in bosqichida qaysi "xona tanlash" oynasi ochilishini hal qiladi:
 * - dacha — hech qanday tanlov ko'rsatmaydi, yagona birlikka avtomatik tayinlaydi.
 * - hostel — yotoq tanlash oynasi.
 * - qolganlari — mavjud xona tanlash oynasi (o'zgarishsiz).
 */
export function CheckInDialog({ open, onClose, reservation, onAssigned }: Props) {
  const partnerType = useAuthStore((s) => s.user?.partnerType);
  const listingName = useDataStore((s) => s.listing.name);
  const ensureSingleUnitRoom = useDataStore((s) => s.ensureSingleUnitRoom);
  const assignRoom = useAssignRoom();
  const dacha = isDacha(partnerType);
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !reservation || !dacha) return;
    if (handledRef.current === reservation.id) return;
    handledRef.current = reservation.id;

    const room = ensureSingleUnitRoom(listingName || "Dacha");
    assignRoom.mutate(
      { id: reservation.id, roomNumber: room.number },
      {
        onSuccess: () => {
          onAssigned?.(room.number);
          onClose();
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reservation, dacha]);

  if (dacha) return null;

  if (hasBeds(partnerType)) {
    return (
      <AssignBedDialog
        open={open}
        onClose={onClose}
        reservation={reservation}
        onAssigned={onAssigned}
      />
    );
  }

  return (
    <AssignRoomDialog
      open={open}
      onClose={onClose}
      reservation={reservation}
      onAssigned={onAssigned}
    />
  );
}
