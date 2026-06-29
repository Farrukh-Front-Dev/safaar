"use client";

import { BedDouble, Info, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardBody } from "../../_components/ui/card";
import { Dialog } from "../../_components/ui/dialog";
import {
  RoomStatusBadge,
  roomStatusLabel,
} from "../../_components/domain/room-status-badge";
import { PageHeader } from "../../_components/layout/page-header";
import { useRooms } from "../../_hooks/use-rooms";
import { useDataStore } from "../../_stores/data-store";
import { cn } from "../../_lib/utils/cn";
import { RoomStatus, type Room } from "../../_lib/domain/types";
import { formatDate } from "../../_lib/utils/format";

const STATUS_OPTIONS: { key: "all" | RoomStatus; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: RoomStatus.VACANT_CLEAN, label: "Toza & bo'sh" },
  { key: RoomStatus.OCCUPIED, label: "Band" },
  { key: RoomStatus.VACANT_DIRTY, label: "Iflos & bo'sh" },
  { key: RoomStatus.OUT_OF_SERVICE, label: "Ta'mirda" },
  { key: RoomStatus.BLOCKED, label: "Bloklangan" },
];

const STATUS_ACTIONS: {
  status: RoomStatus;
  label: string;
  desc: string;
}[] = [
  {
    status: RoomStatus.VACANT_CLEAN,
    label: "Toza & bo'sh",
    desc: "Yangi mehmonni qabul qilishga tayyor",
  },
  {
    status: RoomStatus.VACANT_DIRTY,
    label: "Iflos & bo'sh",
    desc: "Tozalash kerak",
  },
  {
    status: RoomStatus.OUT_OF_SERVICE,
    label: "Ta'mirda",
    desc: "Texnik xizmat ko'rsatilmoqda",
  },
  {
    status: RoomStatus.BLOCKED,
    label: "Bloklangan",
    desc: "Sotuvga qo'yilmagan",
  },
];

export function RoomsView() {
  const { data } = useRooms();
  const setRoomStatus = useDataStore((s) => s.setRoomStatus);
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");
  const [openRoom, setOpenRoom] = useState<Room | null>(null);

  const counts = useMemo(() => {
    const c: Record<"all" | RoomStatus, number> = {
      all: data.length,
      [RoomStatus.VACANT_CLEAN]: 0,
      [RoomStatus.VACANT_DIRTY]: 0,
      [RoomStatus.OCCUPIED]: 0,
      [RoomStatus.OUT_OF_SERVICE]: 0,
      [RoomStatus.BLOCKED]: 0,
    };
    for (const r of data) c[r.status]++;
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((r) => r.status === filter);
  }, [data, filter]);

  const byFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const r of filtered) {
      if (!map.has(r.floor)) map.set(r.floor, []);
      map.get(r.floor)!.push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operatsion"
        title="Xonalar"
        description="Mehmonxonadagi har bir xonaning hozirgi holati."
      />

      {/* Yo'l-yo'riq */}
      <div className="flex items-start gap-2 rounded-card border border-brand-200 bg-brand-50/50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900/50 dark:bg-brand-950/30 dark:text-brand-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          <strong>Maslahat:</strong> xona kartochkasiga bosing — uning holatini
          o'zgartirish mumkin (tozalandi, ta'mirda...).
        </p>
      </div>

      {/* Statistika kartochkalar */}
      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatusTile
          label="Toza & bo'sh"
          value={counts[RoomStatus.VACANT_CLEAN]}
          tone="accent"
        />
        <StatusTile
          label="Band"
          value={counts[RoomStatus.OCCUPIED]}
          tone="brand"
        />
        <StatusTile
          label="Iflos & bo'sh"
          value={counts[RoomStatus.VACANT_DIRTY]}
          tone="warning"
        />
        <StatusTile
          label="Ta'mirda"
          value={counts[RoomStatus.OUT_OF_SERVICE]}
          tone="danger"
        />
        <StatusTile
          label="Bloklangan"
          value={counts[RoomStatus.BLOCKED]}
          tone="neutral"
        />
      </section>

      {/* Filter tab'lari */}
      <div
        role="tablist"
        className="flex flex-wrap gap-1 rounded-card border border-[var(--border)] bg-[var(--surface)] p-1"
      >
        {STATUS_OPTIONS.map((o) => {
          const active = filter === o.key;
          return (
            <button
              key={o.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(o.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-[var(--surface-muted)] dark:text-zinc-300",
              )}
            >
              {o.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {counts[o.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Qavatlar bo'yicha grid */}
      <div className="space-y-6">
        {byFloor.map(([floor, rooms]) => (
          <div key={floor} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                {floor}-qavat
              </h2>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({rooms.length} ta xona)
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {rooms.map((room) => (
                <RoomTile
                  key={room.id}
                  room={room}
                  onClick={() => setOpenRoom(room)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={Boolean(openRoom)}
        onClose={() => setOpenRoom(null)}
        title={openRoom ? `Xona ${openRoom.number}` : ""}
        description={
          openRoom
            ? `${openRoom.roomTypeName} · ${openRoom.floor}-qavat`
            : undefined
        }
      >
        {openRoom && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-[var(--surface-muted)] p-3 text-sm">
              <p className="text-xs text-[var(--muted-foreground)]">
                Hozirgi holat
              </p>
              <div className="mt-1">
                <RoomStatusBadge status={openRoom.status} />
              </div>
              {openRoom.occupant && (
                <div className="mt-3 border-t border-[var(--border)] pt-3 text-xs">
                  <p className="font-medium">{openRoom.occupant.guestName}</p>
                  <p className="text-[var(--muted-foreground)]">
                    Ketadi: {formatDate(openRoom.occupant.checkOut)}
                  </p>
                </div>
              )}
            </div>

            {openRoom.status === RoomStatus.OCCUPIED ? (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-semibold">Mehmon hozir ichida</p>
                <p className="mt-1 text-xs">
                  Xona holatini o'zgartirish uchun avval mehmonni check-out
                  qiling.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">Yangi holatni tanlang:</p>
                <ul className="flex flex-col gap-2">
                  {STATUS_ACTIONS.filter(
                    (a) => a.status !== openRoom.status,
                  ).map((a) => (
                    <li key={a.status}>
                      <button
                        type="button"
                        onClick={() => {
                          setRoomStatus(openRoom.id, a.status);
                          toast.success(
                            `Xona ${openRoom.number}: ${a.label.toLowerCase()}`,
                          );
                          setOpenRoom(null);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{a.label}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {a.desc}
                          </span>
                        </div>
                        <RoomStatusBadge status={a.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function statusBg(status: RoomStatus): string {
  switch (status) {
    case RoomStatus.VACANT_CLEAN:
      return "border-accent-200 bg-accent-50/50 dark:bg-accent-900/10 dark:border-accent-900/40";
    case RoomStatus.OCCUPIED:
      return "border-brand-200 bg-brand-50/50 dark:bg-brand-900/10 dark:border-brand-900/40";
    case RoomStatus.VACANT_DIRTY:
      return "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40";
    case RoomStatus.OUT_OF_SERVICE:
      return "border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/40";
    case RoomStatus.BLOCKED:
      return "border-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-700";
  }
}

function RoomTile({ room, onClick }: { room: Room; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-2 rounded-card border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
        statusBg(room.status),
      )}
      aria-label={`Xona ${room.number} — ${roomStatusLabel(room.status)}, holatini o'zgartirish`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="text-xl font-bold tracking-tight">{room.number}</span>
        <BedDouble
          className="h-4 w-4 text-[var(--muted-foreground)] opacity-60 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <p className="text-[11px] text-[var(--muted-foreground)]">
        {room.roomTypeName}
      </p>
      <RoomStatusBadge status={room.status} />
      {room.occupant && (
        <div className="mt-1 flex w-full flex-col gap-0.5 border-t border-[var(--border)] pt-2 text-xs">
          <span className="inline-flex items-center gap-1 truncate font-medium">
            <User className="h-3 w-3 shrink-0" aria-hidden />
            {room.occupant.guestName}
          </span>
          <span className="text-[var(--muted-foreground)]">
            → {formatDate(room.occupant.checkOut)}
          </span>
        </div>
      )}
    </button>
  );
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "brand" | "warning" | "danger" | "neutral";
}) {
  const toneClass = {
    accent: "text-accent-700",
    brand: "text-brand-700",
    warning: "text-amber-700",
    danger: "text-red-700",
    neutral: "text-zinc-700 dark:text-zinc-300",
  }[tone];

  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium text-[var(--muted-foreground)]">
          {label}
        </p>
        <p className={cn("mt-1 text-2xl font-bold tracking-tight", toneClass)}>
          {value}
        </p>
      </CardBody>
    </Card>
  );
}
