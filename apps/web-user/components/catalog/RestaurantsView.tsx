"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Star, Utensils, Clock, PhoneCall } from "lucide-react";
import { formatSum } from "@/lib/money";

export interface RestaurantItem {
  id: string;
  name: string;
  cityName: string;
  address: string;
  cuisine: string;
  rating: number;
  reviewsCount: number;
  averageCheckSum: number;
  workingHours: string;
  imageUrl: string;
  phone: string;
}

const MOCK_RESTAURANTS: RestaurantItem[] = [
  {
    id: "r-1",
    name: "Besh Qozon (Osh Markazi)",
    cityName: "Toshkent",
    address: "Iftxor ko'chasi, 1-uy (Toshkent teleminorasi atrofi)",
    cuisine: "Milliy taomlar / Palov",
    rating: 4.9,
    reviewsCount: 1420,
    averageCheckSum: 65000,
    workingHours: "09:00 – 17:00",
    imageUrl: "/Tashkent-city-skyline.jpeg",
    phone: "+998 71 200 01 01",
  },
  {
    id: "r-2",
    name: "Platan Restaurant & Garden",
    cityName: "Samarqand",
    address: "Pushkin ko'chasi, 56",
    cuisine: "Yevropa va Sharq oshxonasi",
    rating: 4.8,
    reviewsCount: 680,
    averageCheckSum: 140000,
    workingHours: "11:00 – 23:00",
    imageUrl: "/Samarkand-Registan-cinematic.jpeg",
    phone: "+998 66 233 80 80",
  },
  {
    id: "r-3",
    name: "Chor Bakr Milliy Choyxonasi",
    cityName: "Buxoro",
    address: "Chor Bakr majmuasi yaqinida",
    cuisine: "Buxoro Somsa & Kabob",
    rating: 4.7,
    reviewsCount: 450,
    averageCheckSum: 85000,
    workingHours: "10:00 – 22:00",
    imageUrl: "/Bukhara-old-city-golden-hour.jpeg",
    phone: "+998 65 224 12 34",
  },
  {
    id: "r-4",
    name: "Muzey Choyxonasi (Ichan Kala)",
    cityName: "Xiva",
    address: "Ichan Qal'a markazi",
    cuisine: "Xorazm Tuxum-barak va Shivit Oshi",
    rating: 4.9,
    reviewsCount: 380,
    averageCheckSum: 95000,
    workingHours: "10:00 – 23:00",
    imageUrl: "/Khiva-Ichan-Kala-aerial.jpeg",
    phone: "+998 62 375 44 11",
  },
];

export function RestaurantsView() {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const filtered = MOCK_RESTAURANTS.filter((r) => {
    const matchesQuery =
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(query.toLowerCase());
    const matchesCity =
      selectedCity === "all" || r.cityName.toLowerCase() === selectedCity.toLowerCase();
    return matchesQuery && matchesCity;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero Header */}
      <header className="relative mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-primary-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-300">
            <Utensils className="h-3.5 w-3.5" /> Milliy va Xalqaro Oshxona
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            O'zbekistonning Eng Saralangan Restoranlari
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Toshkent palovidan Xorazm shivit oshigacha — shahringizdagi eng mazali maskanlarni kashf eting.
          </p>

          {/* Search controls */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Restoran nomi yoki taom turi..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 backdrop-blur-md transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur-md focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="all" className="bg-slate-900 text-white">Barcha shaharlar</option>
              <option value="Toshkent" className="bg-slate-900 text-white">Toshkent</option>
              <option value="Samarqand" className="bg-slate-900 text-white">Samarqand</option>
              <option value="Buxoro" className="bg-slate-900 text-white">Buxoro</option>
              <option value="Xiva" className="bg-slate-900 text-white">Xiva</option>
            </select>
          </div>
        </div>
      </header>

      {/* Grid listing */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-btn transition-all duration-200 hover:border-slate-300 hover:shadow-btn-hover sm:flex-row dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative aspect-16/10 shrink-0 overflow-hidden sm:w-48 sm:aspect-auto">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-xs font-bold text-amber-600 shadow-btn backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/90 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {item.rating.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                    {item.name}
                  </h2>
                  <span className="shrink-0 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    {item.cuisine}
                  </span>
                </div>

                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {item.address}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {item.workingHours}
                  </span>
                  <span className="font-semibold text-primary-700 dark:text-primary-400">
                    O'rtacha chek: {formatSum(item.averageCheckSum)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <a
                  href={`tel:${item.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  {item.phone}
                </a>
                <button
                  type="button"
                  onClick={() => alert(`"Stol band qilish" xizmati tez orada ishga tushadi! Bog'lanish: ${item.phone}`)}
                  className="rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-btn transition-all hover:bg-primary-700 active:scale-95"
                >
                  Stol band qilish
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
