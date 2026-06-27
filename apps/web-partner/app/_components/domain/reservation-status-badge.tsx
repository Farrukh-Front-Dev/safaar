import { BookingStatus } from "@agoda/types";
import { Badge } from "../ui/badge";
import type { ReservationUiStatus } from "../../_lib/domain/types";

const labels: Record<ReservationUiStatus, string> = {
  [BookingStatus.PENDING]: "Yangi",
  [BookingStatus.CONFIRMED]: "Tasdiqlangan",
  IN_HOUSE: "Mehmonxonada",
  [BookingStatus.CANCELLED]: "Bekor qilingan",
  [BookingStatus.COMPLETED]: "Yakunlangan",
};

const tones: Record<
  ReservationUiStatus,
  "warning" | "brand" | "accent" | "danger" | "neutral"
> = {
  [BookingStatus.PENDING]: "warning",
  [BookingStatus.CONFIRMED]: "brand",
  IN_HOUSE: "accent",
  [BookingStatus.CANCELLED]: "danger",
  [BookingStatus.COMPLETED]: "neutral",
};

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationUiStatus;
}) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
