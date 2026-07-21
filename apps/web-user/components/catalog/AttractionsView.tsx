"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Compass, Camera, Info } from "lucide-react";

export interface AttractionItem {
  id: string;
  name: string;
  cityName: string;
  category: string;
  description: string;
  rating: number;
  imageUrl: string;
  bestTimeToVisit: string;
}

const CATEGORIES = ["all", "Tarixiy Obida", "UNESCO Merosi", "Tabiat & Hordiq"] as const;

const MOCK_ATTRACTIONS: AttractionItem[] = [
  {
    id: "a-1",
    name: "Registon Majmuasi",
    cityName: "Samarqand",
    category: "Tarixiy Obida",
    description: "XV-XVII asrlarga oid 3 ta muhtasham madrasadan iborat dunyoga mashhur me'moriy ansambl.",
    rating: 5.0,
    imageUrl: "/Samarkand-Registan-cinematic.jpeg",
    bestTimeToVisit: "Bahor va Kuz (Kechki chiroqlar bilan)",
  },
  {
    id: "a-2",
    name: "Ichan Qal'a (Ochiq Osmon Ostidagi Muzey)",
    cityName: "Xiva",
    category: "UNESCO Merosi",
    description: "O'rta asr osiyo shaharsozligining saqlanib qolgan yagona qadimiy devorlar bilan o'ralgan majmuasi.",
    rating: 4.9,
    imageUrl: "/Khiva-Ichan-Kala-aerial.jpeg",
    bestTimeToVisit: "Erta tong va Quyosh botishi",
  },
  {
    id: "a-3",
    name: "Poyi Kalon va Minora",
    cityName: "Buxoro",
    category: "Tarixiy Obida",
    description: "47 metr balandlikdagi 1127-yilda qurilgan afsonaviy Kalon minorasi va Jome masjidi.",
    rating: 4.9,
    imageUrl: "/Bukhara-old-city-golden-hour.jpeg",
    bestTimeToVisit: "Oltin soat (Golden Hour)",
  },
  {
    id: "a-4",
    name: "Chorvoq Suv Ombori & Chimgon Tog'lari",
    cityName: "Toshkent viloyati",
    category: "Tabiat & Hordiq",
    description: "Tog'lar bag'ridagi ko'k-mo'jiza ko'l va yil davomida faol bo'lgan kurort zonasi.",
    rating: 4.8,
    imageUrl: "/Charvak-Lake-drone.jpeg",
    bestTimeToVisit: "Yoz oylari va Qishki chang'i mavsumi",
  },
];

export function AttractionsView() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = MOCK_ATTRACTIONS.filter((a) => {
    const matchesQuery =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.cityName.toLowerCase().includes(query.toLowerCase()) ||
      a.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || a.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero Banner — Safaar Brand Primary Colors */}
      <header className="relative mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-primary-950 via-primary-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-300">
            <Compass className="h-3.5 w-3.5 text-primary-400" /> Sayohat va Ziyorat
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl text-white">
            O'zbekistonning Mo'jizakor Maskanlari
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Buyuk Ipak Yo'li durdonalari, ko'hna me'moriy ansambllar va bahavo tog' manzaralari.
          </p>

          {/* Search bar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Obida nomi, shahar yoki kalit so'z..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 backdrop-blur-md transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold backdrop-blur-md transition-all ${
                  selectedCategory === cat
                    ? "bg-primary-600 text-white shadow-btn"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {cat === "all" ? "Barcha joylar" : cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Grid listing */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:border-slate-300 hover:shadow-btn-hover active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative aspect-16/9 w-full overflow-hidden bg-primary-50">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <Camera className="h-3.5 w-3.5 text-primary-300" />
                {item.category}
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h2 className="text-lg font-bold drop-shadow-xs sm:text-xl">
                  {item.name}
                </h2>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                  <MapPin className="h-3.5 w-3.5 text-primary-300" />
                  {item.cityName}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium text-primary-700 dark:text-primary-400">
                  <Info className="h-3.5 w-3.5" />
                  Ziyorat vaqti: {item.bestTimeToVisit}
                </span>
                <button
                  type="button"
                  onClick={() => alert(`${item.name} bo'yicha ekskursiya va yo'l ko'rsatkichlar tez orada qo'shiladi!`)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Batafsil
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
