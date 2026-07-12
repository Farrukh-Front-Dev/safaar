import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { getBooking } from "@/lib/api/bookings";
import { formatSum } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import type { BookingView } from "@/types/view";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const dict = await getDictionary(locale, "booking");

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/booking/${id}`)}`);
  }

  const booking: BookingView | null = await getBooking(session, id).catch(
    () => null,
  );

  if (!booking) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {dict.error}
        </p>
      </main>
    );
  }

  const statuses = dict.statuses as Record<string, string>;
  const paymentStatuses = dict.paymentStatuses as Record<string, string>;
  const statusLabel = statuses[booking.status] ?? booking.status;
  const payment = booking.payment;
  const canPay =
    payment && payment.url && payment.status !== "paid" ? payment.url : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <BackButton className="fixed left-4 top-16 z-50 md:left-8 md:top-20" />
      <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>

      <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-6 dark:border-white/15">
        <Row label={dict.number} value={booking.bookingNumber} />
        <Row label={dict.status}>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {statusLabel}
          </span>
        </Row>
        <Row label={dict.total} value={formatSum(booking.totalSum)} />
        {payment && (
          <Row label={dict.payment}>
            <span className="text-sm">
              {paymentStatuses[payment.status] ?? payment.status}
            </span>
          </Row>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {canPay && (
          <a href={canPay} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" size="lg">{dict.pay}</Button>
          </a>
        )}
        <Link href={`/${locale}`}>
          <Button variant="secondary" size="lg">
            {dict.backHome}
          </Button>
        </Link>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      {children ?? <span className="font-medium">{value}</span>}
    </div>
  );
}
