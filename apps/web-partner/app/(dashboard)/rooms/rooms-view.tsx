"use client";

import {
  BedDouble,
  Brush,
  Building2,
  DoorOpen,
  Search,
  SlidersHorizontal,
  Tag,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../_components/ui/button";
import { Card, CardBody } from "../../_components/ui/card";
import { Dialog } from "../../_components/ui/dialog";
import { Input } from "../../_components/ui/input";
import {
  RoomStatusBadge,
  roomStatusLabel,
} from "../../_components/domain/room-status-badge";
import { PageHeader } from "../../_components/layout/page-header";
import { useRooms } from "../../_hooks/use-rooms";
import { useRoomTypes } from "../../_hooks/use-room-types";
import { useDataStore } from "../../_stores/data-store";
import { cn } from "../../_lib/utils/cn";
import { RoomStatus, type Room } from "../../_lib/domain/types";
import { formatDate, formatMoney } from "../../_lib/utils/format";

type StatusFilter = "all" | RoomStatus;
type TypeFilter = "all" | string;

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: RoomStatus.VACANT_CLEAN, label: "Toza & bo'sh" },
  { key: RoomStatus.OCCUPIED, label: "Band" },
  { key: RoomStatus.VACANT_DIRTY, label: "Tozalash kerak" },
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
    label: "Tozalash kerak",
    desc: "Housekeeping navbatiga qo'shiladi",
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
  const { data: roomTypes } = useRoomTypes();
  const setRoomStatus = useDataStore((s) => s.setRoomStatus);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [openRoom, setOpenRoom] = useState<Room | null>(null);
  const selectedStatusLabel =
    STATUS_OPTIONS.find((option) => option.key === statusFilter)?.label ??
    "Hammasi";
  const selectedTypeLabel =
    typeFilter === "all"
      ? "Hamma turlar"
      : roomTypes.find((roomType) => roomType.id === typeFilter)?.name ??
        "Xona turi";
  const hasSearchOrFilter =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all";

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

  const stats = useMemo(() => {
    const listed = data.filter((room) => room.isListed).length;
    const needsAttention =
      counts[RoomStatus.VACANT_DIRTY] + counts[RoomStatus.OUT_OF_SERVICE];
    const occupancy = data.length
      ? Math.round((counts[RoomStatus.OCCUPIED] / data.length) * 100)
      : 0;
    return { listed, needsAttention, occupancy };
  }, [counts, data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((room) => {
      if (statusFilter !== "all" && room.status !== statusFilter) return false;
      if (typeFilter !== "all" && room.roomTypeId !== typeFilter) return false;
      if (!q) return true;
      return [
        room.number,
        room.floor,
        room.roomTypeName,
        room.occupant?.guestName,
        roomStatusLabel(room.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, statusFilter, typeFilter]);

  const byFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const room of filtered) {
      if (!map.has(room.floor)) map.set(room.floor, []);
      map.get(room.floor)!.push(room);
    }
    return Array.from(map.entries())
      .map(([floor, rooms]) => [
        floor,
        rooms.sort((a, b) => Number(a.number) - Number(b.number)),
      ] as const)
      .sort(([a], [b]) => a - b);
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Xona holati"
        title="Xonalar"
        description="Real xona raqamlari, housekeeping holati, sotuvdagi xonalar va bandlik nazorati."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Building2 />}
          label="Jami xonalar"
          value={data.length.toString()}
          hint={`${roomTypes.length} ta xona e'loni turi`}
        />
        <MetricCard
          icon={<DoorOpen />}
          label="Bo'sh va tayyor"
          value={counts[RoomStatus.VACANT_CLEAN].toString()}
          hint="Bugun sotishga tayyor"
          tone="accent"
        />
        <MetricCard
          icon={<User />}
          label="Bandlik"
          value={`${stats.occupancy}%`}
          hint={`${counts[RoomStatus.OCCUPIED]} xona band`}
          tone="brand"
        />
        <MetricCard
          icon={<Brush />}
          label="Diqqat kerak"
          value={stats.needsAttention.toString()}
          hint="Tozalash yoki ta'mir"
          tone={stats.needsAttention > 0 ? "warning" : "neutral"}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Status</h2>
              <div role="tablist" aria-label="Xona statusi" className="grid gap-1">
                {STATUS_OPTIONS.map((option) => {
                  const active = statusFilter === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setStatusFilter(option.key)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand-700 text-white shadow-sm"
                          : "text-zinc-600 hover:bg-[var(--surface-muted)] dark:text-zinc-300",
                      )}
                    >
                      <span>{option.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                        )}
                      >
                        {counts[option.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Xona e'loni turi</h2>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:border-brand-600 focus:outline-none"
                aria-label="Xona turi bo'yicha filter"
              >
                <option value="all">Hamma turlar</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
              <div className="rounded-md bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Sotuvda:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {stats.listed}/{data.length}
                </span>{" "}
                xona web-user broni uchun ochiq.
              </div>
            </CardBody>
          </Card>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-3 shadow-card">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-[240px] flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600 dark:text-brand-300"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="101, Lyuks, Aliyev yoki tozalash..."
                  className="h-11 rounded-lg border-[var(--border-strong)] bg-[var(--surface-muted)] pl-9 pr-10 text-[15px] shadow-inner focus:bg-[var(--surface)]"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Xonalar ichidan qidirish"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    aria-label="Qidiruvni tozalash"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  {selectedStatusLabel}
                </span>
                <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {selectedTypeLabel}
                </span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/35 dark:text-brand-200">
                  {filtered.length} ta natija
                </span>
                {hasSearchOrFilter && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Tozalash
                  </Button>
                )}
              </div>
            </div>
          </div>

          {byFloor.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Bu filter bo'yicha xona topilmadi.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-5">
              {byFloor.map(([floor, rooms]) => (
                <div key={floor} className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                        {floor}-qavat
                      </h2>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {rooms.length} ta xona
                      </span>
                    </div>
                    <FloorSummary rooms={rooms} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
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
          )}
        </section>
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
        footer={
          <Button variant="outline" onClick={() => setOpenRoom(null)}>
            Yopish
          </Button>
        }
      >
        {openRoom && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox label="Hozirgi holat" value={<RoomStatusBadge status={openRoom.status} />} />
              <InfoBox
                label="Sotuv holati"
                value={openRoom.isListed ? "E'londa faol" : "Sotuvdan yopiq"}
              />
              <InfoBox
                label="Bir kechalik narx"
                value={formatMoney(openRoom.nightlyPrice ?? 0)}
              />
              <InfoBox label="Xona turi" value={openRoom.roomTypeName} />
            </div>

            {openRoom.occupant && (
              <div className="rounded-card border border-brand-200 bg-brand-50/60 p-3 text-sm text-brand-950 dark:border-brand-900/50 dark:bg-brand-950/25 dark:text-brand-100">
                <p className="font-semibold">{openRoom.occupant.guestName}</p>
                <p className="mt-1 text-xs">
                  Ketadi: {formatDate(openRoom.occupant.checkOut)}
                </p>
              </div>
            )}

            {openRoom.status === RoomStatus.OCCUPIED ? (
              <div className="rounded-card bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-semibold">Mehmon hozir ichida</p>
                <p className="mt-1 text-xs">
                  Xona holatini o'zgartirish uchun avval mehmonni check-out
                  qiling.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Yangi holatni tanlang:</p>
                {STATUS_ACTIONS.filter((a) => a.status !== openRoom.status).map(
                  (action) => (
                    <button
                      key={action.status}
                      type="button"
                      onClick={() => {
                        setRoomStatus(openRoom.id, action.status);
                        toast.success(
                          `Xona ${openRoom.number}: ${action.label.toLowerCase()}`,
                        );
                        setOpenRoom(null);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-card border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                    >
                      <span className="flex flex-col">
                        <span className="font-medium">{action.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {action.desc}
                        </span>
                      </span>
                      <RoomStatusBadge status={action.status} />
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "brand" | "accent" | "warning";
}) {
  const toneClass = {
    neutral: "bg-[var(--surface-muted)] text-[var(--muted-foreground)]",
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-950/35 dark:text-brand-200",
    accent:
      "bg-accent-50 text-accent-700 dark:bg-accent-950/35 dark:text-accent-200",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-200",
  }[tone];

  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md [&>svg]:h-5 [&>svg]:w-5",
            toneClass,
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">
            {label}
          </p>
          <p className="mt-0.5 truncate text-lg font-semibold">{value}</p>
          <p className="truncate text-[11px] text-[var(--muted-foreground)]">
            {hint}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function FloorSummary({ rooms }: { rooms: Room[] }) {
  const clean = rooms.filter((room) => room.status === RoomStatus.VACANT_CLEAN).length;
  const dirty = rooms.filter((room) => room.status === RoomStatus.VACANT_DIRTY).length;
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--muted-foreground)]">
      <span className="rounded-full bg-accent-50 px-2 py-0.5 text-accent-700 dark:bg-accent-950/35 dark:text-accent-200">
        {clean} tayyor
      </span>
      {dirty > 0 && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/35 dark:text-amber-200">
          {dirty} tozalash
        </span>
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

function statusIcon(status: RoomStatus) {
  switch (status) {
    case RoomStatus.VACANT_CLEAN:
      return <DoorOpen className="h-4 w-4" aria-hidden />;
    case RoomStatus.OCCUPIED:
      return <User className="h-4 w-4" aria-hidden />;
    case RoomStatus.VACANT_DIRTY:
      return <Brush className="h-4 w-4" aria-hidden />;
    case RoomStatus.OUT_OF_SERVICE:
      return <Wrench className="h-4 w-4" aria-hidden />;
    case RoomStatus.BLOCKED:
      return <BedDouble className="h-4 w-4" aria-hidden />;
  }
}

function RoomTile({ room, onClick }: { room: Room; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[168px] flex-col items-start gap-3 rounded-card border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
        statusBg(room.status),
      )}
      aria-label={`Xona ${room.number} — ${roomStatusLabel(room.status)}, holatini o'zgartirish`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div>
          <span className="text-2xl font-bold tracking-tight">{room.number}</span>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {room.floor}-qavat
          </p>
        </div>
        <span className="rounded-md bg-white/60 p-2 text-[var(--muted-foreground)] dark:bg-black/15">
          {statusIcon(room.status)}
        </span>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{room.roomTypeName}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Tag className="h-3 w-3" aria-hidden />
          {room.nightlyPrice ? formatMoney(room.nightlyPrice) : "Narx yo'q"}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <RoomStatusBadge status={room.status} />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            room.isListed
              ? "bg-accent-50 text-accent-700 dark:bg-accent-950/35 dark:text-accent-200"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
          )}
        >
          {room.isListed ? "E'londa" : "Yopiq"}
        </span>
      </div>

      {room.occupant && (
        <div className="mt-auto flex w-full flex-col gap-0.5 border-t border-[var(--border)] pt-2 text-xs">
          <span className="inline-flex items-center gap-1 truncate font-medium">
            <User className="h-3 w-3 shrink-0" aria-hidden />
            {room.occupant.guestName}
          </span>
          <span className="text-[var(--muted-foreground)]">
            Ketadi: {formatDate(room.occupant.checkOut)}
          </span>
        </div>
      )}
    </button>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-card bg-[var(--surface-muted)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
