"use client";

import { BedDouble, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardBody } from "../../_components/ui/card";
import { Skeleton } from "../../_components/ui/skeleton";
import {
  RoomStatusBadge,
  roomStatusLabel,
} from "../../_components/domain/room-status-badge";
import { PageHeader } from "../../_components/layout/page-header";
import { useRooms } from "../../_hooks/use-rooms";
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

export function RoomsView() {
  const { data, isLoading } = useRooms();
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");

  const counts = useMemo(() => {
    const c: Record<"all" | RoomStatus, number> = {
      all: data?.length ?? 0,
      [RoomStatus.VACANT_CLEAN]: 0,
      [RoomStatus.VACANT_DIRTY]: 0,
      [RoomStatus.OCCUPIED]: 0,
      [RoomStatus.OUT_OF_SERVICE]: 0,
      [RoomStatus.BLOCKED]: 0,
    };
    for (const r of data ?? []) c[r.status]++;
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((r) => r.status === filter);
  }, [data, filter]);

  // Qavatlar bo'yicha guruhlash
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
        description="Housekeeping holati va xona band-bo'shlik holati."
      />

      {/* Statistika kartochkalar */}
      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatusTile
          label="Toza & bo'sh"
          value={counts[RoomStatus.VACANT_CLEAN]}
          tone="accent"
          loading={isLoading}
        />
        <StatusTile
          label="Band"
          value={counts[RoomStatus.OCCUPIED]}
          tone="brand"
          loading={isLoading}
        />
        <StatusTile
          label="Iflos & bo'sh"
          value={counts[RoomStatus.VACANT_DIRTY]}
          tone="warning"
          loading={isLoading}
        />
        <StatusTile
          label="Ta'mirda"
          value={counts[RoomStatus.OUT_OF_SERVICE]}
          tone="danger"
          loading={isLoading}
        />
        <StatusTile
          label="Bloklangan"
          value={counts[RoomStatus.BLOCKED]}
          tone="neutral"
          loading={isLoading}
        />
      </section>

      {/* Filter */}
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
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
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
                  <RoomTile key={room.id} room={room} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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

function RoomTile({ room }: { room: Room }) {
  return (
    <button
      type="button"
      className={cn(
        "group flex flex-col items-start gap-2 rounded-card border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        statusBg(room.status),
      )}
      aria-label={`Xona ${room.number} — ${roomStatusLabel(room.status)}`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="text-xl font-bold tracking-tight">{room.number}</span>
        <BedDouble
          className="h-4 w-4 text-[var(--muted-foreground)]"
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
  loading,
}: {
  label: string;
  value: number;
  tone: "accent" | "brand" | "warning" | "danger" | "neutral";
  loading: boolean;
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
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-12" />
        ) : (
          <p className={cn("mt-1 text-2xl font-bold tracking-tight", toneClass)}>
            {value}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
