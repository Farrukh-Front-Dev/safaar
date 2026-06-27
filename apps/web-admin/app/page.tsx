import type { User } from "@agoda/types";
import { Role } from "@agoda/types";

const stats = [
  { label: "Jami foydalanuvchilar", value: "45 230" },
  { label: "Faol hamkorlar", value: "320" },
  { label: "Bugungi bronlar", value: "1 240" },
  { label: "Oylik daromad", value: "85 mln so'm" },
];

const pendingPartners: Pick<User, "id" | "fullName" | "role">[] = [
  { id: "P-12", fullName: "Hotel Samarkand MChJ", role: Role.PARTNER },
  { id: "P-13", fullName: "Buxoro Travel", role: Role.PARTNER },
];

export default function AdminDashboard() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          admin.uzbron.uz
        </span>
        <h1 className="text-3xl font-bold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Platformaning to'liq nazorat va boshqaruv paneli.
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
        <h2 className="text-xl font-semibold">Tasdiq kutayotgan hamkorlar</h2>
        <ul className="flex flex-col gap-2">
          {pendingPartners.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/15"
            >
              <span className="font-medium">{p.fullName}</span>
              <span className="text-sm text-zinc-500">{p.role}</span>
              <span className="text-sm text-indigo-600">Ko'rib chiqish →</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
