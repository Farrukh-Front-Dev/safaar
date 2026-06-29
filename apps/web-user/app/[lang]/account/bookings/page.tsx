import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { getMyBookings } from "@/lib/api/users";
import { formatSum } from "@/lib/money";
import { bookingStatusTone, statusBadgeClasses } from "@/lib/bookingStatus";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { BookingView } from "@/types/view";

export default async function AccountBookingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const session = await getSession();
  if (!session) {
    redirect(
      `/${locale}/login?next=${encodeURIComponent(`/${locale}/account/bookings`)}`,
    );
  }

  const dict = await getDictionary(locale, "account");
  const bookings: BookingView[] = await getMyBookings(session).catch(() => []);

  if (bookings.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-slate-500">{dict.bookings.empty}</p>
        </CardBody>
      </Card>
    );
  }

  const statuses = dict.bookings.statuses as Record<string, string>;
  const typeLabels: Record<string, string> = {
    hotel: dict.bookings.hotel,
    bus: dict.bookings.bus,
  };

  return (
    <ul className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const statusLabel = statuses[booking.status] ?? booking.status;
        const typeLabel = typeLabels[booking.type] ?? booking.type;
        const tone = bookingStatusTone(booking.status);
        return (
          <li key={booking.id}>
            <Card>
              <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {booking.bookingNumber}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {typeLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[tone]}`}
                    >
                      {statusLabel}
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatSum(booking.totalSum)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/${locale}/booking/${booking.id}`}
                  className="shrink-0"
                >
                  <Button variant="secondary">{dict.bookings.view}</Button>
                </Link>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
