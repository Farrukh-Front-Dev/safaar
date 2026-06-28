import { BookingStatus } from "@agoda/types";
import { Badge } from "../ui/badge";
import type { ReservationUiStatus } from "../../_lib/domain/types";

const labels: Record<ReservationUiStatus, string> = {
  [BookingStatus.PENDING]: "Yangi",
  [BookingStatus.AWAITING_PAYMENT]: "To'lov kutilmoqda",
  [BookingStatus.AWAITING_PARTNER_CONFIRMATION]: "Tasdiq kutilmoqda",
  [BookingStatus.CONFIRMED]: "Tasdiqlangan",
  IN_HOUSE: "Mehmonxonada",
  [BookingStatus.CANCELLED]: "Bekor qilingan",
  [BookingStatus.COMPLETED]: "Yakunlangan",
  [BookingStatus.EXPIRED]: "Muddati o'tgan",
};

const tones: Record<
  ReservationUiStatus,
  "warning" | "brand" | "accent" | "danger" | "neutral"
> = {
  [BookingStatus.PENDING]: "warning",
  [BookingStatus.AWAITING_PAYMENT]: "warning",
  [BookingStatus.AWAITING_PARTNER_CONFIRMATION]: "warning",
  [BookingStatus.CONFIRMED]: "brand",
  IN_HOUSE: "accent",
  [BookingStatus.CANCELLED]: "danger",
  [BookingStatus.COMPLETED]: "neutral",
  [BookingStatus.EXPIRED]: "danger",
};

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationUiStatus;
}) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
