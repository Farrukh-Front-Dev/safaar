/**
 * Bron endpointlari (USER, himoyalangan). Backend `bookings.controller.ts`.
 * Himoyalangan — sessiyadan dev auth headerlari yuboriladi.
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import { devAuthHeaders, type Session } from "@/lib/auth/session";
import { toBookingView } from "@/lib/adapters/booking";
import type { BookingView } from "@/types/view";

export interface CreateHotelBookingInput {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  paymentMethod?: string;
}

/** `POST /bookings/hotel` — mehmonxona broni yaratish. */
export async function createHotelBooking(
  session: Session,
  input: CreateHotelBookingInput,
): Promise<BookingView> {
  const raw = await api.post<unknown>(
    "/bookings/hotel",
    {
      hotel_id: input.hotelId,
      room_id: input.roomId,
      check_in: input.checkIn,
      check_out: input.checkOut,
      rooms: 1,
      adults: input.guests ?? 1,
      payment_method: input.paymentMethod ?? "click",
    },
    { headers: devAuthHeaders(session) },
  );
  return toBookingView(camelizeKeys(raw));
}

/** `GET /bookings/:id` — bron tafsiloti. */
export async function getBooking(
  session: Session,
  id: string,
): Promise<BookingView> {
  const raw = await api.get<unknown>(`/bookings/${encodeURIComponent(id)}`, {
    headers: devAuthHeaders(session),
  });
  return toBookingView(camelizeKeys(raw));
}


export interface CreateBusBookingInput {
  tripId: string;
  seats: string[];
  paymentMethod?: string;
}

/** `POST /bookings/bus` — avtobus broni yaratish. */
export async function createBusBooking(
  session: Session,
  input: CreateBusBookingInput,
): Promise<BookingView> {
  const raw = await api.post<unknown>(
    "/bookings/bus",
    {
      trip_id: input.tripId,
      seats: input.seats,
      payment_method: input.paymentMethod ?? "click",
    },
    { headers: devAuthHeaders(session) },
  );
  return toBookingView(camelizeKeys(raw));
}
