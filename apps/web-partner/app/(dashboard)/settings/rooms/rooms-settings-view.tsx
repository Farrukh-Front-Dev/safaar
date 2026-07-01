"use client";

import {
  BedDouble,
  Info,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../_components/ui/button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../../_components/ui/card";
import { ConfirmDialog } from "../../../_components/ui/dialog";
import { EmptyState } from "../../../_components/ui/empty-state";
import { Tooltip } from "../../../_components/ui/tooltip";
import { useDataStore } from "../../../_stores/data-store";
import { useRooms } from "../../../_hooks/use-rooms";
import { useRoomTypes } from "../../../_hooks/use-room-types";
import { formatMoney } from "../../../_lib/utils/format";
import type { Room, RoomType } from "../../../_lib/domain/types";
import { RoomTypeDialog } from "./_dialogs/room-type-dialog";
import { RoomDialog } from "./_dialogs/room-dialog";
import { BulkRoomsDialog } from "./_dialogs/bulk-rooms-dialog";

export function RoomsSettingsView() {
  const { data: roomTypes } = useRoomTypes();
  const { data: rooms } = useRooms();
  const deleteRoomType = useDataStore((s) => s.deleteRoomType);
  const deleteRoom = useDataStore((s) => s.deleteRoom);

  // Dialog holatlari
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<RoomType | null>(null);
  const [deleteRm, setDeleteRm] = useState<Room | null>(null);

  // Xona soni har bir tur uchun
  const roomsByType = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rooms) m.set(r.roomTypeId, (m.get(r.roomTypeId) ?? 0) + 1);
    return m;
  }, [rooms]);

  // Qavatlar bo'yicha xonalar
  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const r of rooms) {
      if (!map.has(r.floor)) map.set(r.floor, []);
      map.get(r.floor)!.push(r);
    }
    return Array.from(map.entries())
      .map(([floor, list]) => [
        floor,
        list.sort((a, b) => Number(a.number) - Number(b.number)),
      ] as const)
      .sort(([a], [b]) => a - b);
  }, [rooms]);

  return (
    <div className="flex flex-col gap-6">
      {/* Yo'l-yo'riq */}
      <div className="flex items-start gap-2 rounded-card border border-brand-200 bg-brand-50/50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900/50 dark:bg-brand-950/30 dark:text-brand-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <p>
            <strong>Boshlanish tartibi:</strong>
          </p>
          <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-xs">
            <li>
              Avval <strong>xona turlari</strong>ni yarating (Standart, Lyuks
              va h.k.).
            </li>
            <li>
              Keyin <strong>xonalarni</strong> qo'shing — bir nechtasini
              birdaniga qo'shish mumkin.
            </li>
          </ol>
        </div>
      </div>

      {/* Xona turlari */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <div className="flex flex-col">
            <CardTitle>Xona turlari</CardTitle>
            <span className="text-xs text-[var(--muted-foreground)]">
              {roomTypes.length} ta tur
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingType(null);
              setTypeDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Yangi tur
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {roomTypes.length === 0 ? (
            <EmptyState
              icon={<BedDouble className="h-8 w-8" aria-hidden />}
              title="Hozircha xona turi yo'q"
              description="Standart, Lyuks va h.k. — birinchi turingizni yarating."
              action={
                <Button
                  onClick={() => {
                    setEditingType(null);
                    setTypeDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Birinchi turni qo'shish
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/40 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-5 py-3">Nomi</th>
                    <th className="px-5 py-3">Sig'im</th>
                    <th className="px-5 py-3">Bir kechalik</th>
                    <th className="px-5 py-3">Qulayliklar</th>
                    <th className="px-5 py-3">Xonalar soni</th>
                    <th className="px-5 py-3 text-right">Harakat</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((rt) => (
                    <tr
                      key={rt.id}
                      className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--surface-muted)]"
                    >
                      <td className="px-5 py-3 font-medium">{rt.name}</td>
                      <td className="px-5 py-3 text-[var(--muted-foreground)]">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" aria-hidden />
                          {rt.capacity} kishi
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatMoney(rt.basePrice)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {rt.amenities.length > 0
                            ? rt.amenities.slice(0, 3).join(", ") +
                              (rt.amenities.length > 3
                                ? ` +${rt.amenities.length - 3}`
                                : "")
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {roomsByType.get(rt.id) ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Tooltip content="Tahrirlash">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingType(rt);
                                setTypeDialogOpen(true);
                              }}
                              aria-label="Tahrirlash"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                          </Tooltip>
                          <Tooltip content="O'chirish">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteType(rt)}
                              aria-label="O'chirish"
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Xonalar */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <div className="flex flex-col">
            <CardTitle>Xonalar</CardTitle>
            <span className="text-xs text-[var(--muted-foreground)]">
              Jami {rooms.length} ta xona,{" "}
              {roomsByFloor.length} qavat
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={roomTypes.length === 0}
              onClick={() => setBulkOpen(true)}
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Ko'p xona qo'shish
            </Button>
            <Button
              size="sm"
              disabled={roomTypes.length === 0}
              onClick={() => {
                setEditingRoom(null);
                setRoomDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Yangi xona
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {roomTypes.length === 0 ? (
            <EmptyState
              icon={<Info className="h-8 w-8" aria-hidden />}
              title="Avval xona turi kerak"
              description="Yuqorida bitta xona turini yarating, keyin xonalarni qo'shasiz."
            />
          ) : rooms.length === 0 ? (
            <EmptyState
              icon={<BedDouble className="h-8 w-8" aria-hidden />}
              title="Hozircha xona yo'q"
              description="Birinchi xonangizni qo'shing yoki bir qavatdagi 10 ta xonani birdaniga yarating."
              action={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBulkOpen(true)}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Ko'p xona
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingRoom(null);
                      setRoomDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Bittadan
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="flex flex-col">
              {roomsByFloor.map(([floor, list]) => (
                <div
                  key={floor}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <div className="flex items-center justify-between bg-[var(--surface-muted)]/40 px-5 py-2">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                      {floor}-qavat
                    </h3>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {list.length} ta xona
                    </span>
                  </div>
                  <ul className="divide-y divide-[var(--border)]">
                    {list.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-[var(--surface-muted)]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold">
                            {r.number}
                          </span>
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {r.roomTypeName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Tooltip content="Tahrirlash">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingRoom(r);
                                setRoomDialogOpen(true);
                              }}
                              aria-label="Tahrirlash"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                            </Button>
                          </Tooltip>
                          <Tooltip content="O'chirish">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteRm(r)}
                              aria-label="O'chirish"
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </Button>
                          </Tooltip>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dialoglar */}
      <RoomTypeDialog
        open={typeDialogOpen}
        onClose={() => setTypeDialogOpen(false)}
        editing={editingType}
      />
      <RoomDialog
        open={roomDialogOpen}
        onClose={() => setRoomDialogOpen(false)}
        editing={editingRoom}
      />
      <BulkRoomsDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />

      <ConfirmDialog
        open={Boolean(deleteType)}
        onClose={() => setDeleteType(null)}
        onConfirm={() => {
          if (!deleteType) return;
          const result = deleteRoomType(deleteType.id);
          if (!result.ok) {
            toast.error(result.reason ?? "O'chirib bo'lmadi");
            return;
          }
          toast.success(`"${deleteType.name}" o'chirildi`);
        }}
        title="Xona turini o'chirish"
        description={
          deleteType
            ? `"${deleteType.name}" o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`
            : ""
        }
        confirmLabel="Ha, o'chirish"
        tone="danger"
      />

      <ConfirmDialog
        open={Boolean(deleteRm)}
        onClose={() => setDeleteRm(null)}
        onConfirm={() => {
          if (!deleteRm) return;
          const result = deleteRoom(deleteRm.id);
          if (!result.ok) {
            toast.error(result.reason ?? "O'chirib bo'lmadi");
            return;
          }
          toast.success(`Xona ${deleteRm.number} o'chirildi`);
        }}
        title="Xonani o'chirish"
        description={
          deleteRm
            ? `Xona ${deleteRm.number} o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`
            : ""
        }
        confirmLabel="Ha, o'chirish"
        tone="danger"
      />
    </div>
  );
}
