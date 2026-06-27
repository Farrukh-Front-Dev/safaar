import type { Hotel } from "@agoda/types";

// Demo ma'lumot — backend API tayyor bo'lguncha mock sifatida ishlatiladi.
const featured: Hotel[] = [
  {
    id: "1",
    name: "Hotel Samarkand",
    city: "Samarqand",
    pricePerNight: 450000,
    rating: 4.7,
    stars: 4,
  },
  {
    id: "2",
    name: "Registon Plaza",
    city: "Buxoro",
    pricePerNight: 380000,
    rating: 4.5,
    stars: 4,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          UzBron.uz
        </span>
        <h1 className="text-4xl font-bold tracking-tight">
          O'zbekiston bo'ylab mehmonxona va avtobus bron qiling
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Mijozlar sayti (User Web App). Bu yerda qidiruv, bron qilish va
          shaxsiy kabinet bo'ladi.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Mashhur takliflar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((hotel) => (
            <article
              key={hotel.id}
              className="rounded-xl border border-black/10 p-5 dark:border-white/15"
            >
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p className="text-sm text-zinc-500">{hotel.city}</p>
              <p className="mt-3 font-medium">
                {hotel.pricePerNight.toLocaleString("uz-UZ")} so'm / kecha
              </p>
              <p className="text-sm text-amber-600">★ {hotel.rating}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
