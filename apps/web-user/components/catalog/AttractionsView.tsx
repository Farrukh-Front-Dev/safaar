"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Compass, Camera, Info } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Clean Shadcn-Style Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Compass className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          <span>Sayohat va Ziyorat</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Attraksionlar va Diqqatga Sazovor Joylar
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Buyuk Ipak Yo'li durdonalari, ko'hna me'moriy ansambllar va bahavo tog' manzaralari.
        </p>

        {/* Clean Filter Controls */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Obida nomi yoki shahar bo'yicha qidiruv..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {cat === "all" ? "Barcha joylar" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing: 2 columns mobile, 4 columns desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {filtered.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
                <Camera className="h-3.5 w-3.5 text-amber-300" />
                {item.category}
              </span>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h2 className="text-lg font-bold sm:text-xl">{item.name}</h2>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-white/80" />
                  {item.cityName}
                </p>
              </div>
            </div>

            <CardBody className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>

              <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">Ziyorat: {item.bestTimeToVisit}</span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs font-bold whitespace-nowrap px-3 sm:w-auto"
                  onClick={() => alert(`${item.name} bo'yicha ma'lumotlar tez orada kengaytiriladi!`)}
                >
                  Batafsil
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
