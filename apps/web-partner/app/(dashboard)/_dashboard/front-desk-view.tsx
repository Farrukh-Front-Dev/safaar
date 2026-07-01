"use client";

import {
  AlertCircle,
  BedDouble,
  CalendarPlus,
  Clock,
  Inbox,
  LogIn,
  LogOut,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../_components/ui/button";
import {
  Card,
  CardBody,
} from "../../_components/ui/card";
import { EmptyState } from "../../_components/ui/empty-state";
import { ConfirmDialog } from "../../_components/ui/dialog";
import { Tooltip } from "../../_components/ui/tooltip";
import { AssignRoomDialog } from "../../_components/domain/assign-room-dialog";
import { OccupancyMeter } from "../../_components/domain/occupancy-meter";
import { SourceBadge } from "../../_components/domain/source-badge";
import { WalkInDialog } from "../../_components/domain/walk-in-dialog";
import { useFrontDeskStats } from "../../_hooks/use-dashboard";
import { useReservations } from "../../_hooks/use-reservations";
import { useDataStore } from "../../_stores/data-store";
import { TODAY_ISO } from "../../_lib/mocks/data";
import { formatMoney, formatPhone } from "../../_lib/utils/format";
import { cn } from "../../_lib/utils/cn";
import type { ReservationView } from "../../_lib/domain/types";

const WEEKDAYS = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];
const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

function formatTodayUz(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}-${MONTHS[d.getMonth()]}`;
}

type TaskKind = "pending" | "arrival" | "departure";

interface Task {
  kind: TaskKind;
  reservation: ReservationView;
}

export function FrontDeskView() {
  const stats = useFrontDeskStats();
  const reservations = useReservations();

  const checkIn = useDataStore((s) => s.checkIn);
  const checkOut = useDataStore((s) => s.checkOut);
  const confirmReservation = useDataStore((s) => s.confirmReservation);
  const rejectReservation = useDataStore((s) => s.rejectReservation);

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [confirmReject, setConfirmReject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | TaskKind>("all");
  const [assignReservation, setAssignReservation] =
    useState<ReservationView | null>(null);

  // Hamma vazifalarni bitta ro'yxat sifatida
  const tasks: Task[] = useMemo(() => {
    const arr: Task[] = [];
    for (const r of reservations.data) {
      if (r.status === BookingStatus.PENDING) {
        arr.push({ kind: "pending", reservation: r });
      } else if (
        r.checkIn === TODAY_ISO &&
        r.status === BookingStatus.CONFIRMED
      ) {
        arr.push({ kind: "arrival", reservation: r });
      } else if (r.checkOut === TODAY_ISO && r.status === "IN_HOUSE") {
        arr.push({ kind: "departure", reservation: r });
      }
    }
    // Tartiblash: zudlik birinchi, keyin keladi, keyin ketadi
    const order: Record<TaskKind, number> = {
      pending: 0,
      arrival: 1,
      departure: 2,
    };
    return arr.sort((a, b) => order[a.kind] - order[b.kind]);
  }, [reservations.data]);

  const counts = useMemo(() => {
    const c = { all: tasks.length, pending: 0, arrival: 0, departure: 0 };
    for (const t of tasks) c[t.kind]++;
    return c;
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.kind === filter);
  }, [tasks, filter]);

  const occupancy = stats.data?.occupancyPercent ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Sarlavha — kompakt */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-300">
            Front Desk
          </span>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bugun, {formatTodayUz(TODAY_ISO)}
          </h1>
        </div>
        <Button onClick={() => setWalkInOpen(true)}>
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Yangi bron
        </Button>
      </div>

      {/* KPI yo'lakchasi — bitta yuza karta */}
      <Card>
        <CardBody className="grid grid-cols-2 gap-px overflow-hidden bg-[var(--border)] p-0 sm:grid-cols-4">
          <KpiCell
            tone="brand"
            icon={<BedDouble className="h-4 w-4" aria-hidden />}
            label="To'liqlik"
            value={`${occupancy}%`}
            hint={`${stats.data?.occupiedRooms ?? 0} / ${stats.data?.totalRooms ?? 0} band`}
          >
            <OccupancyMeter percent={occupancy} className="mt-1.5 h-1.5" />
          </KpiCell>
          <KpiCell
            tone="amber"
            icon={<Clock className="h-4 w-4" aria-hidden />}
            label="Zudlik kerak"
            value={counts.pending}
            hint="javob kutmoqda"
          />
          <KpiCell
            tone="accent"
            icon={<LogIn className="h-4 w-4" aria-hidden />}
            label="Bugun keladi"
            value={counts.arrival}
            hint="check-in qilinadi"
          />
          <KpiCell
            tone="neutral"
            icon={<LogOut className="h-4 w-4" aria-hidden />}
            label="Bugun ketadi"
            value={counts.departure}
            hint="check-out qilinadi"
          />
        </CardBody>
      </Card>

      {/* Vazifalar bloki */}
      <div className="flex flex-col gap-3">
        {/* Tab filter */}
        <div
          role="tablist"
          aria-label="Vazifa turi"
          className="flex flex-wrap gap-1 rounded-card border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          <FilterTab
            active={filter === "all"}
            count={counts.all}
            onClick={() => setFilter("all")}
            label="Hammasi"
          />
          <FilterTab
            active={filter === "pending"}
            count={counts.pending}
            onClick={() => setFilter("pending")}
            label="Zudlik"
            tone="amber"
            icon={<Clock className="h-3.5 w-3.5" aria-hidden />}
          />
          <FilterTab
            active={filter === "arrival"}
            count={counts.arrival}
            onClick={() => setFilter("arrival")}
            label="Keladi"
            tone="brand"
            icon={<LogIn className="h-3.5 w-3.5" aria-hidden />}
          />
          <FilterTab
            active={filter === "departure"}
            count={counts.departure}
            onClick={() => setFilter("departure")}
            label="Ketadi"
            tone="accent"
            icon={<LogOut className="h-3.5 w-3.5" aria-hidden />}
          />
        </div>

        {/* Vazifalar ro'yxati */}
        <Card>
          <CardBody className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-10 w-10" aria-hidden />}
                title="Hammasi joyida!"
                description={
                  filter === "all"
                    ? "Bugun bajariladigan vazifa yo'q."
                    : "Ushbu filterda vazifa yo'q."
                }
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {filtered.map(({ kind, reservation }) => (
                  <TaskRow
                    key={`${kind}-${reservation.id}`}
                    kind={kind}
                    reservation={reservation}
                    onCheckIn={() => {
                      if (!reservation.roomNumber) {
                        setAssignReservation(reservation);
                        return;
                      }
                      checkIn(reservation.id);
                      toast.success(
                        `Check-in qilindi: ${reservation.guest.fullName}`,
                      );
                    }}
                    onCheckOut={() => {
                      checkOut(reservation.id);
                      toast.success(
                        `Check-out qilindi: ${reservation.guest.fullName}`,
                      );
                    }}
                    onConfirm={() => {
                      confirmReservation(reservation.id);
                      toast.success(`Bron tasdiqlandi: ${reservation.id}`);
                    }}
                    onReject={() =>
                      setConfirmReject({
                        id: reservation.id,
                        name: reservation.guest.fullName,
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <WalkInDialog open={walkInOpen} onClose={() => setWalkInOpen(false)} />

      <AssignRoomDialog
        open={Boolean(assignReservation)}
        onClose={() => setAssignReservation(null)}
        reservation={assignReservation}
        onAssigned={() => {
          if (assignReservation) {
            checkIn(assignReservation.id);
            toast.success(
              `Check-in qilindi: ${assignReservation.guest.fullName}`,
            );
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmReject)}
        onClose={() => setConfirmReject(null)}
        onConfirm={() => {
          if (!confirmReject) return;
          rejectReservation(confirmReject.id);
          toast.success(`Bron rad etildi: ${confirmReject.id}`);
        }}
        title="Bron rad etilsinmi?"
        description={
          confirmReject
            ? `${confirmReject.name} ning bronini rad etmoqchimisiz? Mijozga SMS yuboriladi.`
            : ""
        }
        confirmLabel="Ha, rad etish"
        tone="danger"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// KPI cell
// ─────────────────────────────────────────────────────────────────────────

interface KpiCellProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ReactNode;
  tone: "brand" | "accent" | "amber" | "neutral";
  children?: React.ReactNode;
}

function KpiCell({ label, value, hint, icon, tone, children }: KpiCellProps) {
  const toneClasses = {
    brand: "text-brand-700",
    accent: "text-accent-700",
    amber: "text-amber-700",
    neutral: "text-zinc-700 dark:text-zinc-300",
  }[tone];

  return (
    <div className="flex min-w-0 flex-col gap-1.5 bg-[var(--surface)] p-3.5 transition-colors hover:bg-[var(--surface-hover)] sm:p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          {label}
        </span>
        <span className={cn("inline-flex", toneClasses)}>{icon}</span>
      </div>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={cn("text-2xl font-semibold", toneClasses)}>
          {value}
        </span>
        {hint && (
          <span className="min-w-0 text-[11px] text-[var(--muted-foreground)]">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Filter tab
// ─────────────────────────────────────────────────────────────────────────

function FilterTab({
  active,
  count,
  onClick,
  label,
  icon,
  tone,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  tone?: "brand" | "accent" | "amber";
}) {
  const activeClass = {
    brand: "bg-brand-700",
    accent: "bg-accent-600",
    amber: "bg-amber-500",
    undefined: "bg-zinc-700",
  }[tone ?? "undefined"];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        active
          ? `${activeClass} text-white shadow-sm`
          : "text-zinc-600 hover:bg-[var(--surface-hover)] dark:text-zinc-300",
      )}
    >
      {icon}
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          active
            ? "bg-white/20 text-white"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Vazifa qatori — yagona format
// ─────────────────────────────────────────────────────────────────────────

interface TaskRowProps {
  kind: TaskKind;
  reservation: ReservationView;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onConfirm: () => void;
  onReject: () => void;
}

function TaskRow({
  kind,
  reservation: r,
  onCheckIn,
  onCheckOut,
  onConfirm,
  onReject,
}: TaskRowProps) {
  const balance = r.totalPrice - r.paidAmount;

  // Holatga qarab chap belgisi
  const indicator = {
    pending: {
      icon: <AlertCircle className="h-4 w-4" aria-hidden />,
      bg: "bg-amber-100 text-amber-700",
      label: "Yangi",
    },
    arrival: {
      icon: <LogIn className="h-4 w-4" aria-hidden />,
      bg: "bg-brand-100 text-brand-700",
      label: "Keladi",
    },
    departure: {
      icon: <LogOut className="h-4 w-4" aria-hidden />,
      bg: "bg-accent-100 text-accent-700",
      label: "Ketadi",
    },
  }[kind];

  return (
    <li className="grid gap-3 px-3 py-3 transition-colors duration-150 hover:bg-[var(--surface-hover)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      {/* Chap belgisi */}
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          indicator.bg,
        )}
        aria-label={indicator.label}
      >
        {indicator.icon}
      </span>

      {/* Asosiy ma'lumot */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link
            href={`/reservations/${r.id}`}
            className="truncate font-semibold hover:text-brand-700 dark:hover:text-brand-300"
          >
            {r.guest.fullName}
          </Link>
          <SourceBadge source={r.source} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3 w-3" aria-hidden />
            {r.roomTypeName}
            {r.roomNumber && (
              <span className="font-mono text-brand-700 dark:text-brand-300">
                {" "}
                · {r.roomNumber}
              </span>
            )}
          </span>
          <span>·</span>
          <span>{r.nights} kech.</span>
          {kind === "departure" && (
            <>
              <span>·</span>
              {balance > 0 ? (
                <span className="font-semibold text-red-600">
                  Qoldiq: {formatMoney(balance)}
                </span>
              ) : (
                <span className="font-medium text-accent-600">
                  To'liq to'langan
                </span>
              )}
            </>
          )}
          {kind === "pending" && (
            <>
              <span>·</span>
              <span className="font-medium">{formatMoney(r.totalPrice)}</span>
            </>
          )}
        </div>
      </div>

      {/* Tezkor aloqa */}
      <div className="flex items-center gap-2 sm:justify-end">
        <Tooltip content="Qo'ng'iroq" side="bottom">
          <a
            href={`tel:+${r.guest.phone}`}
            aria-label={`Qo'ng'iroq: ${formatPhone(r.guest.phone)}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/40 dark:hover:text-brand-300"
          >
            <Phone className="h-4 w-4" aria-hidden />
          </a>
        </Tooltip>

        {/* Asosiy harakat */}
        <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-2 sm:flex-none">
        {kind === "pending" && (
          <>
            <Button size="sm" variant="outline" onClick={onReject}>
              Rad
            </Button>
            <Button size="sm" variant="secondary" onClick={onConfirm}>
              Tasdiqlash
            </Button>
          </>
        )}
        {kind === "arrival" && (
          <Button size="sm" onClick={onCheckIn}>
            <LogIn className="h-3.5 w-3.5" aria-hidden />
            Check-in
          </Button>
        )}
        {kind === "departure" && (
          <Button size="sm" variant="secondary" onClick={onCheckOut}>
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Check-out
          </Button>
        )}
        </div>
      </div>
    </li>
  );
}
