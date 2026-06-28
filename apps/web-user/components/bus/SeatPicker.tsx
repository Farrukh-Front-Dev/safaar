"use client";

import { Fragment, useActionState, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { BusDetailDict } from "@/i18n/dictionaries";
import {
  createBusBookingAction,
  type BusCheckoutState,
} from "@/lib/booking/actions";
import { formatSum } from "@/lib/money";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { BusSeatView } from "@/types/view";

const PAYMENT_METHODS = ["click", "payme", "uzcard", "humo", "cash"] as const;

/** Joylarni 2+2 qatorlarga ajratamiz (chap 2, o'rta yo'lak, o'ng 2). */
function chunkRows(seats: BusSeatView[]): BusSeatView[][] {
  const rows: BusSeatView[][] = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }
  return rows;
}

/**
 * Avtobus joylarini tanlash. Faqat `available` joylar tanlanadi (toggle).
 * Tanlangan kodlar yashirin inputga (vergul bilan) yoziladi va server action
 * (`createBusBookingAction`) orqali bron yaratiladi.
 */
export function SeatPicker({
  locale,
  tripId,
  seats,
  dict,
}: {
  locale: Locale;
  tripId: string;
  seats: BusSeatView[];
  dict: BusDetailDict;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [state, action, pending] = useActionState<BusCheckoutState, FormData>(
    createBusBookingAction,
    {},
  );

  function toggle(seat: BusSeatView) {
    if (seat.status !== "available") return;
    setSelected((prev) =>
      prev.includes(seat.code)
        ? prev.filter((c) => c !== seat.code)
        : [...prev, seat.code],
    );
  }

  const rows = chunkRows(seats);
  const total = seats
    .filter((s) => selected.includes(s.code))
    .reduce((sum, s) => sum + s.priceSum, 0);
  const methods = dict.summary.methods as Record<string, string>;
  const hasSelection = selected.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Joylar to'ri */}
      <section
        aria-label={dict.seats.title}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold">{dict.seats.title}</h2>

        {/* Legend */}
        <ul className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800" />
            {dict.seats.available}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-primary-600" />
            {dict.seats.selected}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
            {dict.seats.occupied}
          </li>
        </ul>

        {seats.length === 0 ? (
          <p className="text-sm text-slate-500">{dict.summary.noSeats}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1fr_1fr_24px_1fr_1fr] items-center gap-2"
              >
                {row.map((seat, seatIndex) => {
                  const isSelected = selected.includes(seat.code);
                  const isFree = seat.status === "available";
                  // O'rta yo'lak: 3-joy oldidan bo'sh ustun.
                  const aisle = seatIndex === 2;
                  return (
                    <Fragment key={seat.id}>
                      {aisle && <span aria-hidden className="h-px" />}
                      <button
                        type="button"
                        onClick={() => toggle(seat)}
                        disabled={!isFree}
                        aria-pressed={isSelected}
                        aria-label={`${dict.seats.title} ${seat.code}`}
                        title={`${seat.code} · ${formatSum(seat.priceSum)}`}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                          isSelected
                            ? "border-primary-600 bg-primary-600 text-white"
                            : isFree
                              ? "border-slate-300 bg-white text-slate-900 hover:border-primary-500"
                              : "cursor-not-allowed border-transparent bg-slate-200 text-slate-400",
                        )}
                      >
                        {seat.code}
                      </button>
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Xulosa + tasdiqlash formasi */}
      <form
        action={action}
        className="flex h-fit flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="seats" value={selected.join(",")} />

        <h2 className="text-lg font-semibold">{dict.summary.title}</h2>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">
            {dict.summary.selectedSeats}
          </span>
          {hasSelection ? (
            <ul className="flex flex-wrap gap-2">
              {selected.map((code) => (
                <li
                  key={code}
                  className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
                >
                  {code}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">{dict.summary.noSeats}</p>
          )}
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {dict.summary.paymentMethod}
          </span>
          <Select name="paymentMethod" defaultValue="click">
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {methods[m] ?? m}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold">
          <span>{dict.summary.total}</span>
          <span>{formatSum(total)}</span>
        </div>

        {!hasSelection && (
          <p className="text-sm text-amber-600">{dict.summary.needSeats}</p>
        )}
        {state.error && (
          <p className="text-sm text-red-600">{dict.summary.error}</p>
        )}

        <Button
          type="submit"
          variant="accent"
          size="lg"
          loading={pending}
          disabled={!hasSelection}
        >
          {dict.summary.confirm}
        </Button>
      </form>
    </div>
  );
}
