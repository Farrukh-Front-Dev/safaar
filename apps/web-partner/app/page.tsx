import type { Booking } from "@agoda/types";
import { BookingStatus } from "@agoda/types";

const stats = [
  { label: "Bugungi bronlar", value: "12" },
  { label: "Bu oydagi daromad", value: "2 400 000 so'm" },
  { label: "Umumiy mijozlar", value: "1 234" },
  { label: "Reyting", value: "★ 4.7" },
];

const recent: Pick<Booking, "id" | "status" | "totalPrice">[] = [
  { id: "BK-1024", status: BookingStatus.CONFIRMED, totalPrice: 450000 },
  { id: "BK-1023", status: BookingStatus.PENDING, totalPrice: 380000 },
];

export default function PartnerDashboard() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          partner.uzbron.uz
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Hamkor kabineti</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Mehmonxona/avtobus hamkorlari uchun boshqaruv paneli.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-black/10 p-5 dark:border-white/15"
          >
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Oxirgi bronlar</h2>
        <ul className="flex flex-col gap-2">
          {recent.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/15"
            >
              <span className="font-medium">{b.id}</span>
              <span className="text-sm text-zinc-500">{b.status}</span>
              <span>{b.totalPrice.toLocaleString("uz-UZ")} so'm</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
