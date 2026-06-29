"use client";

import {
  BedDouble,
  Check,
  Clock,
  LogIn,
  LogOut,
  Phone,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../_components/ui/button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { EmptyState } from "../../_components/ui/empty-state";
import { ConfirmDialog } from "../../_components/ui/dialog";
import { OccupancyMeter } from "../../_components/domain/occupancy-meter";
import { SourceBadge } from "../../_components/domain/source-badge";
import { WalkInDialog } from "../../_components/domain/walk-in-dialog";
import { PageHeader } from "../../_components/layout/page-header";
import { useFrontDeskStats } from "../../_hooks/use-dashboard";
import { useReservations } from "../../_hooks/use-reservations";
import { useDataStore } from "../../_stores/data-store";
import { TODAY_ISO } from "../../_lib/mocks/data";
import { formatDate, formatMoney, formatPhone } from "../../_lib/utils/format";

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

  const all = reservations.data;
  const arrivals = all.filter(
    (r) => r.checkIn === TODAY_ISO && r.status === BookingStatus.CONFIRMED,
  );
  const departures = all.filter(
    (r) => r.checkOut === TODAY_ISO && r.status === "IN_HOUSE",
  );
  const pending = all
    .filter((r) => r.status === BookingStatus.PENDING)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Front Desk"
        title="Bugun nima ish bor?"
        description="Bugungi kelishlar, ketishlar va tasdiqlash kerak bo'lgan bronlar."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stats.refetch();
                reservations.refetch();
                toast.success("Ma'lumotlar yangilandi");
              }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Yangilash
            </Button>
            <Button size="sm" onClick={() => setWalkInOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Yangi bron
            </Button>
          </>
        }
      />

      {/* To'liqlik (occupancy) — katta vurg'u */}
      <Card>
        <CardBody className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              Bugungi to'liqlik
            </p>
            <p className="text-5xl font-bold tracking-tight">
              {stats.data?.occupancyPercent ?? 0}
              <span className="ml-1 text-2xl text-[var(--muted-foreground)]">
                %
              </span>
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">
                {stats.data?.occupiedRooms}
              </span>{" "}
              / {stats.data?.totalRooms} xona band
            </p>
          </div>
          <div className="md:w-1/2">
            <OccupancyMeter
              percent={stats.data?.occupancyPercent ?? 0}
              className="h-3"
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {(stats.data?.occupancyPercent ?? 0) >= 80
                ? "Ajoyib! Mehmonxona deyarli to'liq band."
                : (stats.data?.occupancyPercent ?? 0) >= 50
                  ? "Yaxshi. Bo'sh xonalar bor."
                  : "Bo'sh xonalar ko'p — promo aktsiya o'tkazing?"}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* KPI lentasi */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Bugun keladi"
          value={stats.data?.arrivalsToday ?? 0}
          hint="Kutilayotgan check-in"
          icon={<LogIn className="h-5 w-5" aria-hidden />}
          tone="brand"
        />
        <StatTile
          label="Bugun ketadi"
          value={stats.data?.departuresToday ?? 0}
          hint="Check-out qilinadi"
          icon={<LogOut className="h-5 w-5" aria-hidden />}
          tone="accent"
        />
        <StatTile
          label="Hozir mehmonxonada"
          value={stats.data?.occupiedRooms ?? 0}
          hint="Band xonalar"
          icon={<Users className="h-5 w-5" aria-hidden />}
          tone="neutral"
        />
        <StatTile
          label="Javob kutilmoqda"
          value={stats.data?.pendingReservations ?? 0}
          hint="Yangi bronlar"
          icon={<Clock className="h-5 w-5" aria-hidden />}
          tone="warning"
        />
      </section>

      {/* Bugungi kelishlar va ketishlar */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <LogIn className="h-4 w-4" aria-hidden />
              </span>
              <div className="flex flex-col">
                <CardTitle>Bugun keladi</CardTitle>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Check-in qilish uchun
                </span>
              </div>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {arrivals.length}
            </span>
          </CardHeader>
          <CardBody className="p-0">
            {arrivals.length === 0 ? (
              <EmptyState
                icon={<LogIn className="h-8 w-8" aria-hidden />}
                title="Bugun kelish yo'q"
                description="Ertaga keladiganlarni Kalendarda ko'rishingiz mumkin."
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {arrivals.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link
                        href={`/reservations/${r.id}`}
                        className="truncate font-medium hover:text-brand-700 dark:hover:text-brand-300"
                      >
                        {r.guest.fullName}
                      </Link>
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted-foreground)]">
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
                        <a
                          href={`tel:+${r.guest.phone}`}
                          className="inline-flex items-center gap-1 hover:text-brand-700"
                        >
                          <Phone className="h-3 w-3" aria-hidden />
                          {formatPhone(r.guest.phone)}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SourceBadge source={r.source} />
                      <Button
                        size="sm"
                        onClick={() => {
                          checkIn(r.id);
                          toast.success(
                            `Check-in qilindi: ${r.guest.fullName}`,
                          );
                        }}
                      >
                        <LogIn className="h-3.5 w-3.5" aria-hidden />
                        Check-in
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <LogOut className="h-4 w-4" aria-hidden />
              </span>
              <div className="flex flex-col">
                <CardTitle>Bugun ketadi</CardTitle>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Check-out qilish uchun
                </span>
              </div>
            </div>
            <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-bold text-accent-700 dark:bg-accent-900/40 dark:text-accent-200">
              {departures.length}
            </span>
          </CardHeader>
          <CardBody className="p-0">
            {departures.length === 0 ? (
              <EmptyState
                icon={<LogOut className="h-8 w-8" aria-hidden />}
                title="Bugun ketish yo'q"
                description="Hech kim bugun check-out qilmaydi."
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {departures.map((r) => {
                  const balance = r.totalPrice - r.paidAmount;
                  return (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={`/reservations/${r.id}`}
                          className="truncate font-medium hover:text-brand-700 dark:hover:text-brand-300"
                        >
                          {r.guest.fullName}
                        </Link>
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="inline-flex items-center gap-1 text-[var(--muted-foreground)]">
                            <BedDouble className="h-3 w-3" aria-hidden />
                            {r.roomNumber ?? r.roomTypeName}
                          </span>
                          {balance > 0 ? (
                            <span className="font-semibold text-red-600">
                              Qoldiq: {formatMoney(balance)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-accent-600">
                              <Check className="h-3 w-3" aria-hidden />
                              To'liq to'langan
                            </span>
                          )}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          checkOut(r.id);
                          toast.success(
                            `Check-out qilindi: ${r.guest.fullName}`,
                          );
                        }}
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden />
                        Check-out
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Tasdiq kutayotgan bronlar */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex flex-col">
              <CardTitle>Yangi bronlar — javob kerak</CardTitle>
              <span className="text-xs text-[var(--muted-foreground)]">
                UzBron orqali kelgan, tasdiq kutilmoqda
              </span>
            </div>
          </div>
          <Link
            href="/reservations"
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Hammasini ko'rish →
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {pending.length === 0 ? (
            <EmptyState
              icon={<Check className="h-8 w-8" aria-hidden />}
              title="Hammasi javob berilgan!"
              description="Yangi bronlar yo'q. Yangisi kelganda shu yerda paydo bo'ladi."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/40 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Mijoz</th>
                    <th className="px-5 py-3">Xona</th>
                    <th className="px-5 py-3">Kelish</th>
                    <th className="px-5 py-3">Summa</th>
                    <th className="px-5 py-3 text-right">Harakat</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--surface-muted)]"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/reservations/${r.id}`}
                          className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
                        >
                          {r.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {r.guest.fullName}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatPhone(r.guest.phone)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted-foreground)]">
                        {r.roomTypeName}{" "}
                        <span className="text-xs">
                          ({r.adults} kat.
                          {r.children > 0 && ` + ${r.children} bola`})
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted-foreground)]">
                        {formatDate(r.checkIn)}
                        <span className="ml-1 text-xs">
                          ({r.nights} kech.)
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatMoney(r.totalPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setConfirmReject({
                                id: r.id,
                                name: r.guest.fullName,
                              })
                            }
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                            Rad
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              confirmReservation(r.id);
                              toast.success(`Bron tasdiqlandi: ${r.id}`);
                            }}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            Tasdiqlash
                          </Button>
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

      <WalkInDialog open={walkInOpen} onClose={() => setWalkInOpen(false)} />

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
        cancelLabel="Bekor"
        tone="danger"
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: React.ReactNode;
  tone: "brand" | "accent" | "warning" | "neutral";
}) {
  const toneClasses = {
    brand: "bg-brand-100 text-brand-700",
    accent: "bg-accent-100 text-accent-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  }[tone];

  return (
    <Card className="overflow-hidden">
      <CardBody className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses}`}
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            {label}
          </span>
          <span className="text-2xl font-bold tracking-tight leading-none">
            {value}
          </span>
          {hint && (
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {hint}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
