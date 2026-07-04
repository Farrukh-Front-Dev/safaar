"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../_components/ui/button";
import { Card, CardBody } from "../../_components/ui/card";
import { EmptyState } from "../../_components/ui/empty-state";
import { Tooltip } from "../../_components/ui/tooltip";
import { WalkInDialog } from "../../_components/domain/walk-in-dialog";
import { PageHeader } from "../../_components/layout/page-header";
import { useRooms } from "../../_hooks/use-rooms";
import { useReservations } from "../../_hooks/use-reservations";
import { useRoomTypes } from "../../_hooks/use-room-types";
import { cn } from "../../_lib/utils/cn";
import { formatMoney } from "../../_lib/utils/format";
import { TODAY_ISO } from "../../_lib/mocks/data";
import { ReservationBar } from "./_components/reservation-bar";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABEL = ["Yak", "Du", "Se", "Cho", "Pa", "Ju", "Sha"];
const MONTH_LABEL = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyn",
  "Iyl",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

type ViewMode = 7 | 14 | 30;

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  return Math.round(
    (new Date(a).getTime() - new Date(b).getTime()) / DAY_MS,
  );
}

export function CalendarView() {
  const { data: rooms } = useRooms();
  const { data: reservations } = useReservations();
  const { data: roomTypes } = useRoomTypes();

  const [viewMode, setViewMode] = useState<ViewMode>(14);
  const [startOffset, setStartOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInInitial, setWalkInInitial] = useState<{
    checkIn?: string;
    checkOut?: string;
    roomTypeId?: string;
    roomNumber?: string;
  }>({});

  const startDate = addDays(TODAY_ISO, startOffset);
  const days = useMemo(
    () =>
      Array.from({ length: viewMode }, (_, i) => addDays(startDate, i)),
    [startDate, viewMode],
  );

  const filteredRooms = useMemo(() => {
    if (typeFilter === "all") return rooms;
    return rooms.filter((r) => r.roomTypeId === typeFilter);
  }, [rooms, typeFilter]);

  const sortedRooms = useMemo(
    () =>
      [...filteredRooms].sort(
        (a, b) => Number(a.number) - Number(b.number),
      ),
    [filteredRooms],
  );

  // Cell o'lchami view mode'ga qarab
  const cellWidth =
    viewMode === 7 ? 110 : viewMode === 14 ? 64 : 38;
  const roomColWidth = 156;
  const rowHeight = 58;
  const headerHeight = 56;

  // Bo'sh katakka klik — yangi bron yaratish
  const handleEmptyClick = (roomNumber: string, dateIso: string) => {
    const room = rooms.find((r) => r.number === roomNumber);
    setWalkInInitial({
      checkIn: dateIso,
      checkOut: addDays(dateIso, 1),
      roomTypeId: room?.roomTypeId,
      roomNumber,
    });
    setWalkInOpen(true);
  };

  // Har bir xona uchun joriy oynadagi bronlar
  const reservationsByRoom = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        reservation: (typeof reservations)[number];
        startCol: number;
        spanCols: number;
        truncatedStart: boolean;
        truncatedEnd: boolean;
      }>
    >();

    for (const r of reservations) {
      if (
        r.status === BookingStatus.CANCELLED ||
        r.status === BookingStatus.EXPIRED ||
        !r.roomNumber
      ) {
        continue;
      }

      const ciOffset = dayDiff(r.checkIn, startDate);
      const coOffset = dayDiff(r.checkOut, startDate);

      // Oraliqdan tashqarida bo'lsa — o'tkazib yuborish
      if (coOffset <= 0 || ciOffset >= viewMode) continue;

      const visibleStart = Math.max(0, ciOffset);
      const visibleEnd = Math.min(viewMode, coOffset);
      if (visibleEnd <= visibleStart) continue;

      const entry = {
        reservation: r,
        startCol: visibleStart + 2, // +1 sticky room col + 1 (1-indexed grid)
        spanCols: visibleEnd - visibleStart,
        truncatedStart: ciOffset < 0,
        truncatedEnd: coOffset > viewMode,
      };

      const existing = map.get(r.roomNumber) ?? [];
      existing.push(entry);
      map.set(r.roomNumber, existing);
    }
    return map;
  }, [reservations, startDate, viewMode]);

  const periodLabel = useMemo(() => {
    const last = addDays(startDate, viewMode - 1);
    const sDate = new Date(startDate);
    const eDate = new Date(last);
    return `${sDate.getDate()} ${MONTH_LABEL[sDate.getMonth()]} → ${eDate.getDate()} ${MONTH_LABEL[eDate.getMonth()]}`;
  }, [startDate, viewMode]);

  const periodStats = useMemo(() => {
    const visible = reservations.filter((r) => {
      if (
        r.status === BookingStatus.CANCELLED ||
        r.status === BookingStatus.EXPIRED
      ) {
        return false;
      }
      const ciOffset = dayDiff(r.checkIn, startDate);
      const coOffset = dayDiff(r.checkOut, startDate);
      return coOffset > 0 && ciOffset < viewMode;
    });
    const total = visible.reduce((sum, r) => sum + r.totalPrice, 0);
    const paid = visible.reduce((sum, r) => sum + r.paidAmount, 0);
    return {
      bookings: visible.length,
      total,
      paid,
      balance: total - paid,
      listedRooms: sortedRooms.filter((room) => room.isListed).length,
    };
  }, [reservations, sortedRooms, startDate, viewMode]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Operatsion"
        title="Kalendar"
        description="Har bir real xona bo'yicha bandlik, to'lov va kelish-ketish sanalarini aniq ko'ring."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setWalkInInitial({});
              setWalkInOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Yangi bron
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CalendarMetric
          label="E'londagi xonalar"
          value={`${periodStats.listedRooms} / ${sortedRooms.length}`}
          hint="turistlarga sotuvda"
        />
        <CalendarMetric
          label="Davrdagi bronlar"
          value={periodStats.bookings.toString()}
          hint={periodLabel}
        />
        <CalendarMetric
          label="Oldindan to'langan"
          value={formatMoney(periodStats.paid)}
          hint={`Jami: ${formatMoney(periodStats.total)}`}
        />
        <CalendarMetric
          label="Qoldiq to'lov"
          value={formatMoney(periodStats.balance)}
          hint="kelganda yoki chiqishda olinadi"
          danger={periodStats.balance > 0}
        />
      </section>

      {/* Boshqaruv lentasi */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--border)] bg-[var(--surface)] p-3">
        {/* View mode */}
        <div
          role="tablist"
          aria-label="Ko'rinish davri"
          className="flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1"
        >
          {([7, 14, 30] as const).map((v) => {
            const active = viewMode === v;
            return (
              <button
                key={v}
                role="tab"
                aria-selected={active}
                onClick={() => setViewMode(v)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--surface)] text-brand-700 shadow-sm dark:text-brand-300"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                {v} kun
              </button>
            );
          })}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-1">
          <Tooltip content="Oldingi davr">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStartOffset((v) => v - viewMode)}
              aria-label="Oldingi davr"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStartOffset(0)}
            disabled={startOffset === 0}
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Bugun
          </Button>
          <Tooltip content="Keyingi davr">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStartOffset((v) => v + viewMode)}
              aria-label="Keyingi davr"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </Tooltip>
          <span className="ml-3 text-sm font-medium text-[var(--muted-foreground)]">
            {periodLabel}
          </span>
        </div>

        {/* Room type filter */}
        <select
          aria-label="Xona turi"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="all">Barcha xona turlari</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-brand-500" aria-hidden />
          Tasdiqlangan
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-accent-500" aria-hidden />
          Mehmonxonada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-400" aria-hidden />
          Tasdiq kutmoqda
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-zinc-400" aria-hidden />
          Yakunlangan
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px]">
          <Info className="h-3 w-3" aria-hidden />
          Bo'sh katakka bosib bron yarating
        </span>
      </div>

      {/* Asosiy grid */}
      {sortedRooms.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<CalendarDays className="h-10 w-10" aria-hidden />}
              title="Xonalar yo'q"
              description="Avval Sozlamalar → Xonalar bo'limidan xonalarni qo'shing."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-card border border-[var(--border)] bg-[var(--surface)]">
          <div
            className="relative"
            style={{
              display: "grid",
              gridTemplateColumns: `${roomColWidth}px repeat(${viewMode}, ${cellWidth}px)`,
              gridAutoRows: `${rowHeight}px`,
            }}
          >
            {/* Header (sticky top) — Xona bo'sh katak */}
            <div
              style={{
                gridRow: 1,
                gridColumn: 1,
                height: headerHeight,
                position: "sticky",
                top: 0,
                left: 0,
                zIndex: 30,
              }}
              className="flex items-center justify-center border-b border-r border-[var(--border)] bg-[var(--surface-muted)] text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
            >
              Xona
            </div>

            {/* Header — kun katakchalari */}
            {days.map((iso, i) => {
              const d = new Date(iso);
              const isToday = iso === TODAY_ISO;
              const dow = d.getDay();
              const isWeekend = dow === 0 || dow === 6;
              return (
                <div
                  key={iso}
                  style={{
                    gridRow: 1,
                    gridColumn: i + 2,
                    height: headerHeight,
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center border-b border-r border-[var(--border)] text-[10px] font-medium",
                    isToday
                      ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                      : "bg-[var(--surface-muted)]",
                    isWeekend && !isToday && "text-zinc-400",
                  )}
                >
                  <span className="uppercase tracking-wide">
                    {WEEKDAY_LABEL[dow]}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-sm font-bold leading-none",
                      isToday &&
                        "inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white",
                    )}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}

            {/* Har bir xona uchun qator */}
            {sortedRooms.map((room, rIdx) => {
              const gridRow = rIdx + 2;
              const bars = reservationsByRoom.get(room.number) ?? [];
              return (
                <RoomRow
                  key={room.id}
                  number={room.number}
                  typeName={room.roomTypeName}
                  isListed={room.isListed}
                  nightlyPrice={room.nightlyPrice}
                  gridRow={gridRow}
                  days={days}
                  cellWidth={cellWidth}
                  bars={bars}
                  onEmptyClick={handleEmptyClick}
                />
              );
            })}
          </div>
        </div>
      )}

      <WalkInDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        initialValues={walkInInitial}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Bitta xona qatori — sticky raqam ustun + kun katakchalari + bronlar
// ─────────────────────────────────────────────────────────────────────────

interface RoomRowProps {
  number: string;
  typeName: string;
  isListed: boolean;
  nightlyPrice?: number;
  gridRow: number;
  days: string[];
  cellWidth: number;
  bars: Array<{
    reservation: import("../../_lib/domain/types").ReservationView;
    startCol: number;
    spanCols: number;
    truncatedStart: boolean;
    truncatedEnd: boolean;
  }>;
  onEmptyClick: (roomNumber: string, dateIso: string) => void;
}

function RoomRow({
  number,
  typeName,
  isListed,
  nightlyPrice,
  gridRow,
  days,
  cellWidth,
  bars,
  onEmptyClick,
}: RoomRowProps) {
  void cellWidth;
  return (
    <>
      {/* Sticky xona ustuni */}
      <div
        style={{
          gridRow,
          gridColumn: 1,
          position: "sticky",
          left: 0,
          zIndex: 15,
        }}
        className="flex min-w-0 flex-col items-start justify-center border-b border-r border-[var(--border)] bg-[var(--surface)] px-3"
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-mono text-sm font-bold leading-none">
            {number}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
              isListed
                ? "bg-accent-50 text-accent-700 dark:bg-accent-950/35 dark:text-accent-200"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
            )}
          >
            {isListed ? "E'londa" : "Yopiq"}
          </span>
        </div>
        <span className="mt-1 truncate text-[10px] text-[var(--muted-foreground)]">
          {typeName}
          {nightlyPrice ? ` · ${formatMoney(nightlyPrice)}` : ""}
        </span>
      </div>

      {/* Kun katakchalari (bo'sh, klikga ochiq) */}
      {days.map((iso, i) => {
        const isToday = iso === TODAY_ISO;
        const dow = new Date(iso).getDay();
        const isWeekend = dow === 0 || dow === 6;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onEmptyClick(number, iso)}
            aria-label={`Xona ${number}, ${iso} uchun bron yaratish`}
            style={{ gridRow, gridColumn: i + 2 }}
            className={cn(
              "border-b border-r border-[var(--border)] transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/20",
              isToday && "bg-brand-50 dark:bg-brand-900",
              isWeekend && !isToday && "bg-[var(--surface-muted)]",
            )}
          />
        );
      })}

      {/* Bron bar'lari — kun katakchalari ustida */}
      {bars.map((b) => (
        <ReservationBar
          key={b.reservation.id}
          reservation={b.reservation}
          gridRow={gridRow}
          startCol={b.startCol}
          spanCols={b.spanCols}
          truncatedStart={b.truncatedStart}
          truncatedEnd={b.truncatedEnd}
        />
      ))}
    </>
  );
}

function CalendarMetric({
  label,
  value,
  hint,
  danger,
}: {
  label: string;
  value: string;
  hint: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <p className="text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-lg font-semibold",
          danger ? "text-red-600" : "text-[var(--foreground)]",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-[var(--muted-foreground)]">
        {hint}
      </p>
    </div>
  );
}
