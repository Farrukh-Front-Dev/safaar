/**
 * Bron javobini view-model'ga aylantiruvchi adapter.
 *
 * Backend ikki xil shakl qaytaradi:
 *  - `POST /bookings/hotel` → `{ booking, payment }`
 *  - `GET /bookings/:id`     → `{ ...booking, payment }` (tekis)
 * Adapter ikkalasini ham qoplaydi. Summalar tiyin → so'm.
 */
import { tiyinToSum } from "@/lib/money";
import type { BookingView, PaymentView } from "@/types/view";

interface RawPayment {
  status?: string;
  provider?: string;
  paymentUrl?: string;
}

interface RawBooking {
  id?: string;
  bookingNumber?: string;
  status?: string;
  type?: string;
  totalAmount?: number;
  createdAt?: string;
  payment?: RawPayment;
}

interface RawEnvelope extends RawBooking {
  booking?: RawBooking;
  payment?: RawPayment;
}

function toPaymentView(raw: RawPayment | undefined): PaymentView | undefined {
  if (!raw) return undefined;
  return {
    status: raw.status ?? "pending",
    provider: raw.provider ?? "",
    url: raw.paymentUrl,
  };
}

export function toBookingView(raw: RawEnvelope): BookingView {
  const booking: RawBooking = raw.booking ?? raw;
  const payment = raw.payment ?? booking.payment;

  return {
    id: booking.id ?? "",
    bookingNumber: booking.bookingNumber ?? "",
    status: booking.status ?? "PENDING",
    type: booking.type ?? "hotel",
    totalSum: tiyinToSum(booking.totalAmount ?? 0),
    currency: "UZS",
    createdAt: booking.createdAt ?? "",
    payment: toPaymentView(payment),
  };
}
