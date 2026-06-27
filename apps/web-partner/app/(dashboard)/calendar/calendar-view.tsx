"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../_components/ui/button";
import { PageHeader } from "../../_components/layout/page-header";
import { Skeleton } from "../../_components/ui/skeleton";
import { useRooms } from "../../_hooks/use-rooms";
import { useReservations } from "../../_hooks/use-reservations";
import { cn } from "../../_lib/utils/cn";
import { RoomStatus } from "../../_lib/domain/types";
import { BookingStatus } from "@agoda/types";

const DAYS_TO_SHOW = 14;
const TODAY_ISO = "2026-06-27";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoBetween(date: string, start: string, end: string): boolean {
  return date >= start && date < end;
}

const WEEKDAY_LABEL = ["Yak", "Du", "Se", "Cho", "Pa", "Ju", "Sha"];

export function CalendarView() {
  const [startOffset, setStartOffset] = useState(0);
  const rooms = useRooms();
  const reservations = useReservations();

  const days = useMemo(
    () =>
      Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
        addDays(TODAY_ISO, startOffset + i),
      ),
    [startOffset],
  );

  const isLoading = rooms.isLoading || reservations.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operatsion"
        title="Kalendar"
        description="Xonalar bo'yicha 14 kunlik mavjudlik va bronlar."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStartOffset((v) => v - 7)}
              aria-label="Oldingi hafta"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStartOffset(0)}
            >
              Bugun
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStartOffset((v) => v + 7)}
              aria-label="Keyingi hafta"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
        <LegendDot className="bg-zinc-100 dark:bg-zinc-800" label="Bo'sh" />
        <LegendDot className="bg-brand-500" label="Tasdiqlangan" />
        <LegendDot className="bg-amber-400" label="Kutilmoqda" />
        <LegendDot className="bg-accent-500" label="Mehmonxonada" />
        <LegendDot className="bg-red-300" label="Ta'mirda" />
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                <th className="sticky left-0 z-10 w-20 border-r border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-left">
                  Xona
                </th>
                {days.map((d) => {
                  const date = new Date(d);
                  const isToday = d === TODAY_ISO;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th
                      key={d}
                      className={cn(
                        "min-w-[44px] px-1 py-2 text-center font-medium",
                        isToday && "bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200",
                        isWeekend && !isToday && "text-zinc-400",
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wide">
                        {WEEKDAY_LABEL[date.getDay()]}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-bold",
                          isToday &&
                            "inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white",
                        )}
                      >
                        {date.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {(rooms.data ?? []).map((room) => (
                <tr
                  key={room.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="sticky left-0 z-10 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold">
                        {room.number}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {room.roomTypeName}
                      </span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const reservation = (reservations.data ?? []).find(
                      (r) =>
                        r.roomNumber === room.number &&
                        r.status !== BookingStatus.CANCELLED &&
                        isoBetween(day, r.checkIn, r.checkOut),
                    );

                    let bg = "bg-transparent hover:bg-[var(--surface-muted)]";
                    let title = "Bo'sh";

                    if (room.status === RoomStatus.OUT_OF_SERVICE) {
                      bg = "bg-red-200/60 dark:bg-red-950/30";
                      title = "Ta'mirda";
                    } else if (reservation) {
                      title = `${reservation.guest.fullName} (${reservation.id})`;
                      if (reservation.status === BookingStatus.PENDING) {
                        bg = "bg-amber-300 hover:bg-amber-400";
                      } else if (reservation.status === "IN_HOUSE") {
                        bg = "bg-accent-500 hover:bg-accent-600";
                      } else {
                        bg = "bg-brand-500 hover:bg-brand-600";
                      }
                    }

                    return (
                      <td
                        key={day}
                        className={cn(
                          "h-9 cursor-pointer border-r border-[var(--border)] transition-colors",
                          bg,
                        )}
                        title={title}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn("h-3 w-3 rounded-sm", className)}
        aria-hidden
      />
      {label}
    </span>
  );
}
