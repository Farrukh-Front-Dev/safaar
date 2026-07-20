import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { api } from "@/lib/api";
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

  // SENIOR OPTIMIZATION: Parallelize session and dictionary fetching
  const [dict, session] = await Promise.all([
    getDictionary(locale, "booking"),
    getSession(),
  ]);

  if (!session) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/booking/${id}`)}`);
  }

  const booking: BookingView | null = await api.bookings.getBooking(id, { token: session.accessToken }).catch(
    () => null,
  );

  if (!booking) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-btn dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
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
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{dict.title}</h1>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-btn dark:border-slate-800 dark:bg-slate-900">
        <Row label={dict.number} value={booking.bookingNumber} />
        <Row label={dict.status}>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-800 dark:bg-primary-950 dark:text-primary-300">
            {statusLabel}
          </span>
        </Row>
        <Row label={dict.total} value={formatSum(booking.totalSum)} />
        {payment && (
          <Row label={dict.payment}>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      {children ?? <span className="font-semibold text-slate-900 dark:text-white">{value}</span>}
    </div>
  );
}
