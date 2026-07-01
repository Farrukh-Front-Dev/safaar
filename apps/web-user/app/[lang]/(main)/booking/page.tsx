import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { getHotel } from "@/lib/api/hotels";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const sp = await searchParams;

  const hotelId = one(sp.hotelId);
  const roomId = one(sp.roomId);
  const checkIn = one(sp.checkIn) ?? "";
  const checkOut = one(sp.checkOut) ?? "";
  const guests = Number(one(sp.guests) ?? 2) || 2;

  if (!hotelId || !roomId) {
    redirect(`/${locale}/hotels`);
  }

  // Auth majburiy — kirmagan bo'lsa, shu sahifaga qaytadigan qilib login'ga.
  const session = await getSession();
  if (!session) {
    const query = new URLSearchParams({ hotelId, roomId });
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    query.set("guests", String(guests));
    const next = `/${locale}/booking?${query.toString()}`;
    redirect(`/${locale}/login?next=${encodeURIComponent(next)}`);
  }

  const dict = await getDictionary(locale, "checkout");

  const hotel = await getHotel(locale, hotelId).catch(() => null);
  const room = hotel?.rooms.find((r) => r.id === roomId);
  if (!hotel || !room) {
    redirect(`/${locale}/hotels`);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>
      <CheckoutForm
        locale={locale}
        dict={dict}
        hotelId={hotel.id}
        hotelName={hotel.name}
        room={{ id: room.id, name: room.name, priceSum: room.priceSum }}
        defaults={{ checkIn, checkOut, guests }}
      />
    </main>
  );
}
