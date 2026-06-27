"use client";

import {
  ArrowLeft,
  BedDouble,
  CalendarRange,
  Mail,
  Phone,
  Printer,
  StickyNote,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { BookingStatus } from "@agoda/types";
import { Button } from "../../../_components/ui/button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../../_components/ui/card";
import { EmptyState } from "../../../_components/ui/empty-state";
import { Skeleton } from "../../../_components/ui/skeleton";
import { ReservationStatusBadge } from "../../../_components/domain/reservation-status-badge";
import { SourceBadge } from "../../../_components/domain/source-badge";
import { PageHeader } from "../../../_components/layout/page-header";
import { useReservation } from "../../../_hooks/use-reservations";
import {
  formatDate,
  formatMoney,
  formatPhone,
} from "../../../_lib/utils/format";

export function ReservationDetailView({ id }: { id: string }) {
  const { data, isLoading } = useReservation(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Bron topilmadi"
        description={`ID: ${id}`}
        action={
          <Link href="/reservations">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Bronlar ro'yxatiga
            </Button>
          </Link>
        }
      />
    );
  }

  const balance = data.totalPrice - data.paidAmount;
  const canCheckIn =
    data.status === BookingStatus.CONFIRMED && balance >= 0;
  const canCheckOut = data.status === "IN_HOUSE";
  const canConfirm = data.status === BookingStatus.PENDING;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/reservations"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Bronlar ro'yxati
      </Link>

      <PageHeader
        eyebrow={`Bron ${data.id}`}
        title={data.guest.fullName}
        description={`${formatDate(data.checkIn)} → ${formatDate(data.checkOut)} · ${data.nights} kech.`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" aria-hidden />
              Chop etish
            </Button>
            {canConfirm && (
              <>
                <Button variant="outline" size="sm">
                  Rad etish
                </Button>
                <Button size="sm">Tasdiqlash</Button>
              </>
            )}
            {canCheckIn && <Button size="sm">Check-in qilish</Button>}
            {canCheckOut && (
              <Button variant="secondary" size="sm">
                Check-out qilish
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Asosiy ma'lumotlar (chap, 2 ustun) */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Bron tafsiloti */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Bron tafsiloti</CardTitle>
              <div className="flex items-center gap-2">
                <SourceBadge source={data.source} />
                <ReservationStatusBadge status={data.status} />
              </div>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={<BedDouble className="h-4 w-4" aria-hidden />}
                label="Xona"
                value={
                  <>
                    {data.roomTypeName}
                    {data.roomNumber && (
                      <span className="ml-1 font-mono text-brand-700 dark:text-brand-300">
                        · {data.roomNumber}
                      </span>
                    )}
                  </>
                }
              />
              <InfoItem
                icon={<User className="h-4 w-4" aria-hidden />}
                label="Mehmonlar"
                value={`${data.adults} kattalar${data.children > 0 ? `, ${data.children} bola` : ""}`}
              />
              <InfoItem
                icon={<CalendarRange className="h-4 w-4" aria-hidden />}
                label="Kelish"
                value={formatDate(data.checkIn)}
              />
              <InfoItem
                icon={<CalendarRange className="h-4 w-4" aria-hidden />}
                label="Ketish"
                value={`${formatDate(data.checkOut)} (${data.nights} kech.)`}
              />
              {data.specialRequests && (
                <InfoItem
                  icon={<StickyNote className="h-4 w-4" aria-hidden />}
                  label="Maxsus iltimos"
                  value={data.specialRequests}
                  className="sm:col-span-2"
                />
              )}
            </CardBody>
          </Card>

          {/* Mijoz */}
          <Card>
            <CardHeader>
              <CardTitle>Mijoz</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={<User className="h-4 w-4" aria-hidden />}
                label="Ism"
                value={data.guest.fullName}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" aria-hidden />}
                label="Telefon"
                value={
                  <a
                    href={`tel:+${data.guest.phone}`}
                    className="text-brand-700 hover:underline dark:text-brand-300"
                  >
                    {formatPhone(data.guest.phone)}
                  </a>
                }
              />
              {data.guest.email && (
                <InfoItem
                  icon={<Mail className="h-4 w-4" aria-hidden />}
                  label="Email"
                  value={data.guest.email}
                />
              )}
              {data.guest.document && (
                <InfoItem
                  icon={<StickyNote className="h-4 w-4" aria-hidden />}
                  label="Hujjat"
                  value={data.guest.document}
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* O'ng ustun: moliya */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4" aria-hidden />
              Moliya
            </CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <FinanceRow label="Jami summa" value={formatMoney(data.totalPrice)} />
            <FinanceRow
              label="To'langan"
              value={formatMoney(data.paidAmount)}
              tone={data.paidAmount > 0 ? "accent" : "muted"}
            />
            <div className="my-1 h-px bg-[var(--border)]" />
            <FinanceRow
              label="Qoldiq"
              value={formatMoney(balance)}
              tone={balance > 0 ? "danger" : "accent"}
              bold
            />
            {balance > 0 && (
              <Button variant="secondary" className="mt-2">
                To'lov qabul qilish
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function FinanceRow({
  label,
  value,
  tone = "muted",
  bold = false,
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent" | "danger";
  bold?: boolean;
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent-600"
      : tone === "danger"
        ? "text-red-600"
        : "";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className={`${toneClass} ${bold ? "font-bold" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
