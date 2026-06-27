import { BookingStatus } from "@agoda/types";
import { Badge } from "../ui/badge";

const labels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Kutilmoqda",
  [BookingStatus.CONFIRMED]: "Tasdiqlangan",
  [BookingStatus.CANCELLED]: "Bekor qilingan",
  [BookingStatus.COMPLETED]: "Yakunlangan",
};

const tones: Record<
  BookingStatus,
  "warning" | "accent" | "danger" | "neutral"
> = {
  [BookingStatus.PENDING]: "warning",
  [BookingStatus.CONFIRMED]: "accent",
  [BookingStatus.CANCELLED]: "danger",
  [BookingStatus.COMPLETED]: "neutral",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
