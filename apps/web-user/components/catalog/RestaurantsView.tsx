"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Star, Utensils, Clock, PhoneCall } from "lucide-react";
import { formatSum } from "@/lib/money";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Clean Shadcn-Style Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Utensils className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          <span>Milliy va Xalqaro Oshxona</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Restoranlar va Milliy Taomlar
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          O'zbekistonning eng saralangan restoranlari, milliy oshxonalar va shinam choyxonalari.
        </p>

        {/* Clean Filter Controls */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Restoran nomi yoki taom turi bo'yicha qidiruv..."
              className="pl-10"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-xs transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">Barcha shaharlar</option>
            <option value="Toshkent">Toshkent</option>
            <option value="Samarqand">Samarqand</option>
            <option value="Buxoro">Buxoro</option>
            <option value="Xiva">Xiva</option>
          </select>
        </div>
      </div>

      {/* Clean Grid Listing */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden bg-slate-100 sm:w-48 sm:aspect-auto dark:bg-slate-800">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 200px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-xs font-bold text-amber-600 shadow-xs backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/90 dark:text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {item.rating.toFixed(1)}
                </span>
              </div>

              <CardBody className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      {item.name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.cuisine}
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {item.address}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {item.workingHours}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Chek: {formatSum(item.averageCheckSum)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <a
                    href={`tel:${item.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
                    {item.phone}
                  </a>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => alert(`"Stol band qilish" xizmati tez orada ishga tushadi! Bog'lanish: ${item.phone}`)}
                  >
                    Stol band qilish
                  </Button>
                </div>
              </CardBody>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
