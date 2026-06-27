"use client";

import {
  BedDouble,
  CalendarPlus,
  Clock,
  LogIn,
  LogOut,
  Phone,
  RefreshCw,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../_components/ui/button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { EmptyState } from "../../_components/ui/empty-state";
import { Skeleton } from "../../_components/ui/skeleton";
import { OccupancyMeter } from "../../_components/domain/occupancy-meter";
import { SourceBadge } from "../../_components/domain/source-badge";
import { PageHeader } from "../../_components/layout/page-header";
import { useFrontDeskStats } from "../../_hooks/use-dashboard";
import { useReservations } from "../../_hooks/use-reservations";
import { formatDate, formatMoney, formatPhone } from "../../_lib/utils/format";

const TODAY = "2026-06-27";

export function FrontDeskView() {
  const stats = useFrontDeskStats();
  const reservations = useReservations();

  const all = reservations.data ?? [];
  const arrivals = all.filter(
    (r) => r.checkIn === TODAY && r.status === BookingStatus.CONFIRMED,
  );
  const departures = all.filter(
    (r) => r.checkOut === TODAY && r.status === "IN_HOUSE",
  );
  const pending = all
    .filter((r) => r.status === BookingStatus.PENDING)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Front Desk"
        title="Salom, Resepsiyon!"
        description="Bugungi kelishlar, ketishlar va kutilayotgan bronlar."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stats.refetch();
                reservations.refetch();
              }}
              disabled={stats.isFetching || reservations.isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${stats.isFetching ? "animate-spin" : ""}`}
                aria-hidden
              />
              Yangilash
            </Button>
            <Button size="sm">
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Walk-in bron
            </Button>
          </>
        }
      />

      {/* To'liqlik (occupancy) — katta vurg'u kartochkasi */}
      <Card>
        <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[var(--muted-foreground)]">
              Bugungi to'liqlik
            </p>
            {stats.isLoading || !stats.data ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <p className="text-4xl font-bold tracking-tight">
                {stats.data.occupancyPercent}
                <span className="ml-1 text-xl text-[var(--muted-foreground)]">
                  %
                </span>
              </p>
            )}
            {stats.data && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {stats.data.occupiedRooms} / {stats.data.totalRooms} xona band
              </p>
            )}
          </div>
          <div className="md:w-1/2">
            <OccupancyMeter percent={stats.data?.occupancyPercent ?? 0} />
          </div>
        </CardBody>
      </Card>

      {/* KPI lentasi */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Bugun keladi"
          value={stats.data?.arrivalsToday ?? 0}
          icon={<LogIn className="h-5 w-5" aria-hidden />}
          loading={stats.isLoading}
          tone="brand"
        />
        <StatTile
          label="Bugun ketadi"
          value={stats.data?.departuresToday ?? 0}
          icon={<LogOut className="h-5 w-5" aria-hidden />}
          loading={stats.isLoading}
          tone="accent"
        />
        <StatTile
          label="Hozir mehmonxonada"
          value={stats.data?.occupiedRooms ?? 0}
          icon={<Users className="h-5 w-5" aria-hidden />}
          loading={stats.isLoading}
          tone="neutral"
        />
        <StatTile
          label="Tasdiq kutmoqda"
          value={stats.data?.pendingReservations ?? 0}
          icon={<Clock className="h-5 w-5" aria-hidden />}
          loading={stats.isLoading}
          tone="warning"
        />
      </section>

      {/* Bugungi kelishlar va ketishlar — yonma-yon */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Kelishlar */}
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <LogIn className="h-4 w-4" aria-hidden />
              </span>
              <CardTitle>Bugun keladi</CardTitle>
            </div>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {arrivals.length}
            </span>
          </CardHeader>
          <CardBody className="p-0">
            {reservations.isLoading ? (
              <ListSkeleton />
            ) : arrivals.length === 0 ? (
              <EmptyState
                icon={<LogIn className="h-8 w-8" aria-hidden />}
                title="Bugun kelish yo'q"
                description="Ertaga kelishni Kalendarda ko'ring."
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {arrivals.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{r.guest.fullName}</span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
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
                      <Button size="sm">Check-in</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Ketishlar */}
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <LogOut className="h-4 w-4" aria-hidden />
              </span>
              <CardTitle>Bugun ketadi</CardTitle>
            </div>
            <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700">
              {departures.length}
            </span>
          </CardHeader>
          <CardBody className="p-0">
            {reservations.isLoading ? (
              <ListSkeleton />
            ) : departures.length === 0 ? (
              <EmptyState
                icon={<LogOut className="h-8 w-8" aria-hidden />}
                title="Bugun ketish yo'q"
                description="Mehmonlar ertaroq check-out qilsa, shu yerda ko'rinadi."
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
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{r.guest.fullName}</span>
                        <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="inline-flex items-center gap-1">
                            <BedDouble className="h-3 w-3" aria-hidden />
                            {r.roomNumber ?? r.roomTypeName}
                          </span>
                          {balance > 0 ? (
                            <span className="font-semibold text-red-600">
                              Qoldiq: {formatMoney(balance)}
                            </span>
                          ) : (
                            <span className="font-medium text-accent-600">
                              To'liq to'langan
                            </span>
                          )}
                        </span>
                      </div>
                      <Button variant="secondary" size="sm">
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <TriangleAlert className="h-4 w-4" aria-hidden />
            </span>
            <CardTitle>Tasdiq kutayotgan bronlar</CardTitle>
          </div>
          <Link
            href="/reservations"
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Hammasini ko'rish
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {reservations.isLoading ? (
            <ListSkeleton rows={3} />
          ) : pending.length === 0 ? (
            <EmptyState
              icon={<TriangleAlert className="h-8 w-8" aria-hidden />}
              title="Yangi bron yo'q"
              description="Hammasi javob berilgan!"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
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
                      <td className="px-5 py-3 font-mono text-xs font-medium text-brand-700 dark:text-brand-300">
                        {r.id}
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
                          ({r.adults} kat. {r.children > 0 && `+ ${r.children} bola`})
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted-foreground)]">
                        {formatDate(r.checkIn)}
                        <span className="ml-1 text-xs">({r.nights} kech.)</span>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatMoney(r.totalPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            Rad
                          </Button>
                          <Button size="sm">Tasdiqlash</Button>
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
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  loading,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  tone: "brand" | "accent" | "warning" | "neutral";
}) {
  const toneClasses = {
    brand: "bg-brand-100 text-brand-700",
    accent: "bg-accent-100 text-accent-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  }[tone];

  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses}`}
        >
          {icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
          {loading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <span className="text-2xl font-bold tracking-tight">{value}</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-[var(--border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center justify-between px-5 py-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20" />
        </li>
      ))}
    </ul>
  );
}
