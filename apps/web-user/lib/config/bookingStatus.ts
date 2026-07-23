/**
 * Bron holati uchun semantik "tone" va badge klasslari.
 * `booking/[id]` va `account/bookings` shu bitta manbadan foydalanadi (DRY).
 */
export type StatusTone = "success" | "warning" | "danger" | "neutral";

/** Bron statusini semantik rangga moslaydi. */
export function bookingStatusTone(status: string): StatusTone {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "EXPIRED":
      return "danger";
    case "PENDING":
    case "AWAITING_PAYMENT":
    case "AWAITING_PARTNER_CONFIRMATION":
      return "warning";
    default:
      return "neutral";
  }
}

/** Light-mode badge (pill) klasslari — tone bo'yicha. */
export const statusBadgeClasses: Record<StatusTone, string> = {
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-700",
};
