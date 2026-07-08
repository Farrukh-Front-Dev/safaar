"use client";

import {
  AlertCircle,
  BedDouble,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Inbox,
  LogIn,
  LogOut,
  Phone,
  Search,
  Sparkles,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../_components/ui/button";
import { Card, CardBody } from "../../_components/ui/card";
import { EmptyState } from "../../_components/ui/empty-state";
import { ConfirmDialog } from "../../_components/ui/dialog";
import { Input } from "../../_components/ui/input";
import { Tooltip } from "../../_components/ui/tooltip";
import { AssignRoomDialog } from "../../_components/domain/assign-room-dialog";
import { OccupancyMeter } from "../../_components/domain/occupancy-meter";
import { SourceBadge } from "../../_components/domain/source-badge";
import { WalkInDialog } from "../../_components/domain/walk-in-dialog";
import { PageHeader } from "../../_components/layout/page-header";
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
type FilterKey = "all" | TaskKind;

interface Task {
  kind: TaskKind;
  reservation: ReservationView;
}

const TASK_ORDER: Record<TaskKind, number> = {
  pending: 0,
  arrival: 1,
  departure: 2,
};

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
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [assignReservation, setAssignReservation] =
    useState<ReservationView | null>(null);

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
    return arr.sort((a, b) => TASK_ORDER[a.kind] - TASK_ORDER[b.kind]);
  }, [reservations.data]);

  const counts = useMemo(() => {
    const c = { all: tasks.length, pending: 0, arrival: 0, departure: 0 };
    for (const task of tasks) c[task.kind]++;
    return c;
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? tasks : tasks.filter((task) => task.kind === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(({ reservation }) =>
        [
          reservation.id,
          reservation.guest.fullName,
          reservation.guest.phone,
          reservation.roomTypeName,
          reservation.roomNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [filter, query, tasks]);

  const occupancy = stats.data?.occupancyPercent ?? 0;
  const nextTask = tasks[0];
  const activeReservations = reservations.data.filter(
    (reservation) =>
      reservation.status !== BookingStatus.CANCELLED &&
      reservation.status !== BookingStatus.EXPIRED &&
      reservation.status !== BookingStatus.COMPLETED,
  );
  const balance = activeReservations.reduce(
    (sum, reservation) =>
      sum + Math.max(0, reservation.totalPrice - reservation.paidAmount),
    0,
  );

  const handleCheckIn = (reservation: ReservationView) => {
    setAssignReservation(reservation);
  };

  const handleCheckOut = (reservation: ReservationView) => {
    checkOut(reservation.id);
    toast.success(`Check-out qilindi: ${reservation.guest.fullName}`);
  };

  const handleConfirm = (reservation: ReservationView) => {
    confirmReservation(reservation.id);
    toast.success(`Bron tasdiqlandi: ${reservation.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Front Desk"
        title={`Bugun, ${formatTodayUz(TODAY_ISO)}`}
        description="Resepsiyon uchun eng kerakli ishlar: yangi bronlar, check-in, check-out va to'lov nazorati."
        actions={
          <>
            <Link href="/calendar">
              <Button variant="outline" size="sm">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Kalendar
              </Button>
            </Link>
            <Button size="sm" onClick={() => setWalkInOpen(true)}>
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Yangi bron
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FrontMetric
          icon={<BedDouble />}
          label="Bandlik"
          value={`${occupancy}%`}
          hint={`${stats.data?.occupiedRooms ?? 0}/${stats.data?.totalRooms ?? 0} xona band`}
          tone="brand"
        >
          <OccupancyMeter percent={occupancy} className="mt-2 h-1.5" />
        </FrontMetric>
        <FrontMetric
          icon={<Clock3 />}
          label="Zudlik kerak"
          value={counts.pending.toString()}
          hint="tasdiq kutayotgan bronlar"
          tone={counts.pending > 0 ? "warning" : "neutral"}
        />
        <FrontMetric
          icon={<LogIn />}
          label="Bugun keladi"
          value={counts.arrival.toString()}
          hint="check-in navbati"
          tone="accent"
        />
        <FrontMetric
          icon={<Wallet />}
          label="Qoldiq to'lov"
          value={formatMoney(balance)}
          hint="faol bronlar bo'yicha"
          tone={balance > 0 ? "danger" : "accent"}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="flex min-w-0 flex-col gap-3">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Bugungi ish navbati</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Avval zudlik, keyin kelish va ketish vazifalari.
                  </p>
                </div>
                <div className="relative min-w-[240px] lg:w-[320px]">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600 dark:text-brand-300"
                    aria-hidden
                  />
                  <Input
                    type="search"
                    placeholder="Ism, telefon, xona..."
                    className="h-10 rounded-lg bg-[var(--surface-muted)] pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Front desk vazifalaridan qidirish"
                  />
                </div>
              </div>

              <div
                role="tablist"
                aria-label="Vazifa turi"
                className="flex border-b border-[var(--border)] mt-2"
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
                  tone="warning"
                />
                <FilterTab
                  active={filter === "arrival"}
                  count={counts.arrival}
                  onClick={() => setFilter("arrival")}
                  label="Keladi"
                  tone="brand"
                />
                <FilterTab
                  active={filter === "departure"}
                  count={counts.departure}
                  onClick={() => setFilter("departure")}
                  label="Ketadi"
                  tone="accent"
                />
              </div>
            </CardBody>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Inbox className="h-10 w-10" aria-hidden />}
                title="Hammasi joyida"
                description={
                  query
                    ? "Qidiruv bo'yicha vazifa topilmadi."
                    : "Ushbu bo'limda bajariladigan vazifa yo'q."
                }
              />
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map(({ kind, reservation }) => (
                <TaskCard
                  key={`${kind}-${reservation.id}`}
                  kind={kind}
                  reservation={reservation}
                  onCheckIn={() => handleCheckIn(reservation)}
                  onCheckOut={() => handleCheckOut(reservation)}
                  onConfirm={() => handleConfirm(reservation)}
                  onReject={() =>
                    setConfirmReject({
                      id: reservation.id,
                      name: reservation.guest.fullName,
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" aria-hidden />
                <h2 className="text-sm font-semibold">Keyingi ish</h2>
              </div>
              {nextTask ? (
                <NextTaskCard task={nextTask} />
              ) : (
                <div className="rounded-card bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted-foreground)]">
                  Hozircha shoshilinch vazifa yo'q.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Tezkor yo'nalishlar</h2>
              <QuickLink href="/reservations" icon={<Users />} label="Bronlar ro'yxati" />
              <QuickLink href="/calendar" icon={<CalendarDays />} label="Bandlik kalendari" />
            </CardBody>
          </Card>
        </aside>
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
            ? `${confirmReject.name} ning bronini rad etmoqchimisiz?`
            : ""
        }
        confirmLabel="Ha, rad etish"
        tone="danger"
      />
    </div>
  );
}

function FrontMetric({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "brand" | "accent" | "warning" | "danger";
  children?: React.ReactNode;
}) {
  const toneClass = {
    neutral: "text-zinc-500",
    brand: "text-brand-600",
    accent: "text-accent-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  }[tone];

  return (
    <div className="flex flex-col gap-2 p-4 border border-[var(--border-light)] rounded-lg bg-white">
      <div className="flex items-center gap-2">
        <span className={cn("[&>svg]:h-4 [&>svg]:w-4", toneClass)}>{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      </div>
      <div>
        <p className="truncate text-2xl font-medium tracking-tight text-zinc-900">{value}</p>
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      </div>
      {children}
    </div>
  );
}

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
  tone?: "brand" | "accent" | "warning";
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-all duration-150",
        active
          ? "border-brand-600 text-brand-700"
          : "border-transparent text-zinc-500 hover:text-zinc-800",
      )}
    >
      {icon}
      {label}
      <span className="ml-1 text-[11px] font-mono text-zinc-400">({count})</span>
    </button>
  );
}

function TaskCard({
  kind,
  reservation,
  onCheckIn,
  onCheckOut,
  onConfirm,
  onReject,
}: {
  kind: TaskKind;
  reservation: ReservationView;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const balance = Math.max(0, reservation.totalPrice - reservation.paidAmount);
  const meta = TASK_META[kind];

  return (
    <div className="grid gap-4 py-4 border-b border-[var(--border-light)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center last:border-b-0 hover:bg-zinc-50 transition-colors px-4 -mx-4">
      <span
        className={cn(
          "flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4",
          meta.iconClass,
        )}
        aria-label={meta.label}
      >
        {meta.icon}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/reservations/${reservation.id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {reservation.guest.fullName}
          </Link>
          <span className={cn("text-[10px] font-medium uppercase tracking-wide", meta.badgeClass)}>
            {meta.label}
          </span>
          <SourceBadge source={reservation.source} />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3 w-3" aria-hidden />
            {reservation.roomTypeName}
            {reservation.roomNumber && (
              <span className="font-mono">· {reservation.roomNumber}</span>
            )}
          </span>
          <span>{reservation.nights} kech.</span>
          <span>{formatMoney(reservation.totalPrice)}</span>
          {kind === "departure" &&
            (balance > 0 ? (
              <span className="font-semibold text-red-600">Qoldiq: {formatMoney(balance)}</span>
            ) : (
              <span className="text-zinc-400">To'liq to'langan</span>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <Tooltip content="Qo'ng'iroq" side="bottom">
          <a
            href={`tel:+${reservation.guest.phone}`}
            aria-label={`Qo'ng'iroq: ${formatPhone(reservation.guest.phone)}`}
            className="text-zinc-400 hover:text-brand-600 transition-colors"
          >
            <Phone className="h-4 w-4" aria-hidden />
          </a>
        </Tooltip>

        {kind === "pending" && (
          <div className="flex gap-2">
            <button className="text-xs font-medium text-red-600 hover:underline" onClick={onReject}>Rad</button>
            <button className="text-xs font-medium text-brand-600 hover:underline" onClick={onConfirm}>Tasdiqlash</button>
          </div>
        )}
        {kind === "arrival" && (
          <button className="text-xs font-medium text-brand-600 hover:underline" onClick={onCheckIn}>Check-in</button>
        )}
        {kind === "departure" && (
          <button className="text-xs font-medium text-zinc-600 hover:underline" onClick={onCheckOut}>Check-out</button>
        )}
      </div>
    </div>
  );
}

const TASK_META: Record<
  TaskKind,
  {
    label: string;
    icon: React.ReactNode;
    iconClass: string;
    badgeClass: string;
  }
> = {
  pending: {
    label: "Yangi",
    icon: <AlertCircle aria-hidden />,
    iconClass: "text-amber-500",
    badgeClass: "text-amber-600",
  },
  arrival: {
    label: "Keladi",
    icon: <LogIn aria-hidden />,
    iconClass: "text-brand-600",
    badgeClass: "text-brand-600",
  },
  departure: {
    label: "Ketadi",
    icon: <LogOut aria-hidden />,
    iconClass: "text-zinc-400",
    badgeClass: "text-zinc-500",
  },
};

function NextTaskCard({ task }: { task: Task }) {
  const meta = TASK_META[task.kind];
  return (
    <Link
      href={`/reservations/${task.reservation.id}`}
      className="block rounded-card border border-[var(--border)] bg-[var(--surface-muted)] p-3 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md [&>svg]:h-4 [&>svg]:w-4", meta.iconClass)}>
          {meta.icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {task.reservation.guest.fullName}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {meta.label} · {task.reservation.roomTypeName}
          </p>
        </div>
      </div>
    </Link>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/25"
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </Link>
  );
}
