import { BookingStatus } from "@agoda/types";
import { Badge } from "../ui/badge";

const labels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Kutilmoqda",
  [BookingStatus.AWAITING_PAYMENT]: "To'lov kutilmoqda",
  [BookingStatus.AWAITING_PARTNER_CONFIRMATION]: "Tasdiq kutilmoqda",
  [BookingStatus.CONFIRMED]: "Tasdiqlangan",
  [BookingStatus.CANCELLED]: "Bekor qilingan",
  [BookingStatus.COMPLETED]: "Yakunlangan",
  [BookingStatus.EXPIRED]: "Muddati o'tgan",
};

const tones: Record<
  BookingStatus,
  "warning" | "accent" | "danger" | "neutral"
> = {
  [BookingStatus.PENDING]: "warning",
  [BookingStatus.AWAITING_PAYMENT]: "warning",
  [BookingStatus.AWAITING_PARTNER_CONFIRMATION]: "warning",
  [BookingStatus.CONFIRMED]: "accent",
  [BookingStatus.CANCELLED]: "danger",
  [BookingStatus.COMPLETED]: "neutral",
  [BookingStatus.EXPIRED]: "danger",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
