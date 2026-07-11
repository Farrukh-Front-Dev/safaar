import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { HotelDetailDict } from "@/i18n/dictionaries";
import { formatSum } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { RoomTypeView } from "@/types/view";

export interface RoomSearchContext {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/**
 * Xona turlari ro'yxati. Har bir xonada narx/sig'im/bo'sh joy va "Bron qilish"
 * CTA. CTA checkout sahifasiga (keyingi slice) kerakli parametrlar bilan link
 * qiladi. Bo'sh xona bo'lmasa — CTA o'chiriladi.
 */
export function RoomList({
  rooms,
  locale,
  hotelId,
  dict,
  search,
}: {
  rooms: RoomTypeView[];
  locale: Locale;
  hotelId: string;
  dict: HotelDetailDict;
  search?: RoomSearchContext;
}) {
  function bookingHref(roomId: string): string {
    const params = new URLSearchParams({ hotelId, roomId });
    if (search?.checkIn) params.set("checkIn", search.checkIn);
    if (search?.checkOut) params.set("checkOut", search.checkOut);
    if (search?.guests) params.set("guests", String(search.guests));
    return `/${locale}/booking?${params.toString()}`;
  }

  return (
    <ul className="flex flex-col gap-3">
      {rooms.map((room) => {
        const soldOut = room.available <= 0;
        return (
          <li
            key={room.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-btn transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-semibold">{room.name}</h3>
              <p className="text-sm text-slate-500">
                {dict.capacity}: {room.capacity} {dict.guests}
                {" · "}
                {soldOut
                  ? dict.soldOut
                  : `${room.available} ${dict.available}`}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <p className="font-semibold">
                {formatSum(room.priceSum)}
                <span className="text-sm font-normal text-slate-500">
                  {" "}
                  / {dict.perNight}
                </span>
              </p>
              {soldOut ? (
                <span className="text-sm text-slate-400">{dict.soldOut}</span>
              ) : (
                <Link
                  href={bookingHref(room.id)}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-full bg-accent-600 px-4 text-sm font-medium text-white shadow-btn transition-all hover:bg-accent-500 hover:shadow-btn-hover active:bg-accent-700 active:scale-[0.97] active:shadow-btn-active",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                  )}
                >
                  {dict.book}
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
