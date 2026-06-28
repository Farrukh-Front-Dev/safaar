"use server";

import { redirect } from "next/navigation";
import { ApiRequestError } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { createHotelBooking } from "@/lib/api/bookings";
import { defaultLocale, isLocale } from "@/i18n/config";

export interface CheckoutState {
  error?: string;
}

export async function createBookingAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const rawLocale = String(formData.get("locale") ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const input = {
    hotelId: String(formData.get("hotelId") ?? ""),
    roomId: String(formData.get("roomId") ?? ""),
    checkIn: String(formData.get("checkIn") ?? ""),
    checkOut: String(formData.get("checkOut") ?? ""),
    guests: Number(formData.get("guests") ?? 1),
    paymentMethod: String(formData.get("paymentMethod") ?? "click"),
  };

  let bookingId = "";
  try {
    const booking = await createHotelBooking(session, input);
    bookingId = booking.id;
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? error.message : "ERROR",
    };
  }

  redirect(`/${locale}/booking/${bookingId}`);
}
