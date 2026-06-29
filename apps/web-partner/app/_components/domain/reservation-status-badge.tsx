import {
  AlertCircle,
  CheckCircle2,
  Clock,
  House,
  XCircle,
} from "lucide-react";
import { BookingStatus } from "@agoda/types";
import { Badge } from "../ui/badge";
import type { ReservationUiStatus } from "../../_lib/domain/types";

const config: Record<
  ReservationUiStatus,
  {
    label: string;
    tone: "warning" | "brand" | "accent" | "danger" | "neutral";
    icon: typeof Clock;
  }
> = {
  [BookingStatus.PENDING]: {
    label: "Javob kutilmoqda",
    tone: "warning",
    icon: Clock,
  },
  [BookingStatus.AWAITING_PAYMENT]: {
    label: "To'lov kutilmoqda",
    tone: "warning",
    icon: Clock,
  },
  [BookingStatus.AWAITING_PARTNER_CONFIRMATION]: {
    label: "Tasdiq kutilmoqda",
    tone: "warning",
    icon: Clock,
  },
  [BookingStatus.CONFIRMED]: {
    label: "Tasdiqlangan",
    tone: "brand",
    icon: CheckCircle2,
  },
  IN_HOUSE: {
    label: "Hozir yashayapti",
    tone: "accent",
    icon: House,
  },
  [BookingStatus.CANCELLED]: {
    label: "Bekor qilingan",
    tone: "danger",
    icon: XCircle,
  },
  [BookingStatus.COMPLETED]: {
    label: "Yakunlangan",
    tone: "neutral",
    icon: CheckCircle2,
  },
  [BookingStatus.EXPIRED]: {
    label: "Muddati o'tgan",
    tone: "danger",
    icon: AlertCircle,
  },
};

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationUiStatus;
}) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <Badge tone={c.tone} icon={<Icon className="h-3 w-3" aria-hidden />}>
      {c.label}
    </Badge>
  );
}
