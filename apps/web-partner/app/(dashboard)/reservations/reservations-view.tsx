"use client";

import { CalendarRange, Download, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../_components/ui/button";
import { EmptyState } from "../../_components/ui/empty-state";
import { Input } from "../../_components/ui/input";
import { Skeleton } from "../../_components/ui/skeleton";
import { ReservationStatusBadge } from "../../_components/domain/reservation-status-badge";
import { SourceBadge } from "../../_components/domain/source-badge";
import { PageHeader } from "../../_components/layout/page-header";
import { useReservations } from "../../_hooks/use-reservations";
import { cn } from "../../_lib/utils/cn";
import type { ReservationUiStatus } from "../../_lib/domain/types";
import { formatDate, formatMoney, formatPhone } from "../../_lib/utils/format";

type FilterKey = "all" | ReservationUiStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: BookingStatus.PENDING, label: "Yangi" },
  { key: BookingStatus.CONFIRMED, label: "Tasdiqlangan" },
  { key: "IN_HOUSE", label: "Mehmonxonada" },
  { key: BookingStatus.COMPLETED, label: "Yakunlangan" },
  { key: BookingStatus.CANCELLED, label: "Bekor qilingan" },
];

export function ReservationsView() {
  const { data, isLoading } = useReservations();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: data?.length ?? 0,
      [BookingStatus.PENDING]: 0,
      [BookingStatus.AWAITING_PAYMENT]: 0,
      [BookingStatus.AWAITING_PARTNER_CONFIRMATION]: 0,
      [BookingStatus.CONFIRMED]: 0,
      IN_HOUSE: 0,
      [BookingStatus.COMPLETED]: 0,
      [BookingStatus.CANCELLED]: 0,
      [BookingStatus.EXPIRED]: 0,
    };
    for (const r of data ?? []) c[r.status]++;
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.id, r.guest.fullName, r.guest.phone, r.roomTypeName, r.roomNumber]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [data, filter, query]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operatsion"
        title="Bronlar"
        description="UzBron'dan kelgan va to'g'ridan-to'g'ri qabul qilingan bronlar."
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" aria-hidden />
            Eksport
          </Button>
        }
      />

      {/* Filter tab'lari */}
      <div
        role="tablist"
        aria-label="Status bo'yicha filter"
        className="flex flex-wrap gap-1 rounded-card border border-[var(--border)] bg-[var(--surface)] p-1"
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-[var(--surface-muted)] dark:text-zinc-300",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Qidiruv */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="ID, ism yoki telefon bo'yicha qidirish..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Bronlar ichidan qidirish"
          />
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">
          {filtered.length} ta natija
        </span>
      </div>

      {/* Jadval */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarRange className="h-10 w-10" aria-hidden />}
          title="Bron topilmadi"
          description="Filter yoki qidiruvni o'zgartirib ko'ring."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Mijoz</th>
                <th className="px-4 py-3">Xona</th>
                <th className="px-4 py-3">Kelish</th>
                <th className="px-4 py-3">Ketish</th>
                <th className="px-4 py-3">Summa</th>
                <th className="px-4 py-3">Manba</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/reservations/${r.id}`}
                      className="font-mono text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{r.guest.fullName}</span>
                      <a
                        href={`tel:+${r.guest.phone}`}
                        className="text-xs text-[var(--muted-foreground)] hover:text-brand-700"
                      >
                        {formatPhone(r.guest.phone)}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {r.roomTypeName}
                    {r.roomNumber && (
                      <span className="ml-1 font-mono text-xs text-brand-700 dark:text-brand-300">
                        · {r.roomNumber}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {formatDate(r.checkIn)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {formatDate(r.checkOut)}
                    <span className="ml-1 text-xs">({r.nights} kech.)</span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatMoney(r.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge source={r.source} />
                  </td>
                  <td className="px-4 py-3">
                    <ReservationStatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
