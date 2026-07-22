"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Car, ShieldCheck, Users, PhoneCall, CheckCircle2, X } from "lucide-react";
import { formatSum } from "@/lib/money";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { CatalogDict } from "@/i18n/dictionaries";

export interface TransportItem {
  id: string;
  name: string;
  cityName: string;
  categoryKey: "rent" | "transfer" | "vip";
  categoryDefault: string;
  seats: number;
  hasDriver: boolean;
  pricePerDaySum: number;
  rating: number;
  imageUrl: string;
  phone: string;
}

const MOCK_TRANSPORTS: TransportItem[] = [
  {
    id: "t-1",
    name: "Chevrolet Cobalt (2024)",
    cityName: "Toshkent",
    categoryKey: "rent",
    categoryDefault: "Avto Ijarasi",
    seats: 4,
    hasDriver: false,
    pricePerDaySum: 350000,
    rating: 4.8,
    imageUrl: "/Tashkent-city-skyline.jpeg",
    phone: "+998 90 123 45 67",
  },
  {
    id: "t-2",
    name: "Kia K5 GT-Line (2024)",
    cityName: "Toshkent",
    categoryKey: "vip",
    categoryDefault: "VIP Taksi",
    seats: 4,
    hasDriver: true,
    pricePerDaySum: 850000,
    rating: 4.9,
    imageUrl: "/Samarkand-Registan-cinematic.jpeg",
    phone: "+998 90 987 65 43",
  },
  {
    id: "t-3",
    name: "Mercedes-Benz Sprinter VIP (15 o'rin)",
    cityName: "Samarqand",
    categoryKey: "transfer",
    categoryDefault: "Aeroport Transfer",
    seats: 15,
    hasDriver: true,
    pricePerDaySum: 1500000,
    rating: 5.0,
    imageUrl: "/Bukhara-old-city-golden-hour.jpeg",
    phone: "+998 66 200 30 40",
  },
  {
    id: "t-4",
    name: "Chevrolet Tahoe Premier",
    cityName: "Toshkent / Samarqand / Buxoro",
    categoryKey: "vip",
    categoryDefault: "VIP & Biznes Taksi",
    seats: 7,
    hasDriver: true,
    pricePerDaySum: 2200000,
    rating: 4.9,
    imageUrl: "/Khiva-Ichan-Kala-aerial.jpeg",
    phone: "+998 71 500 00 00",
  },
];

const FALLBACK_DICT: CatalogDict["transport"] = {
  badge: "Avtotransport & Transfer",
  title: "Avto Ijarasi va Transfer Xizmatlari",
  subtitle: "O'zbekiston bo'ylab qulay sayohat qilish uchun avtomobil ijarasi, VIP taksi va aeroport transferlari.",
  searchPlaceholder: "Avto rusumi yoki shahar bo'yicha qidiruv...",
  allTypes: "Barcha turlar",
  categories: {
    all: "Barcha turlar",
    rent: "Avto Ijarasi (Rent a Car)",
    transfer: "Aeroport Transfer",
    vip: "VIP & Biznes Taksi",
  },
  perDay: "kuniga",
  driverIncluded: "Haydovchi bilan",
  withoutDriver: "Haydovchisiz",
  reserve: "Ijaraga olish",
  comingSoon: "{name} bo'yicha buyurtma tez orada ishga tushadi! Bog'lanish: {phone}",
};

export function TransportView({ dict = FALLBACK_DICT }: { dict?: CatalogDict["transport"] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<TransportItem | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    { id: "all", label: dict.categories?.all ?? dict.allTypes },
    { id: "rent", label: dict.categories?.rent ?? "Avto Ijarasi" },
    { id: "transfer", label: dict.categories?.transfer ?? "Aeroport Transfer" },
    { id: "vip", label: dict.categories?.vip ?? "VIP Taksi" },
  ];

  const filtered = MOCK_TRANSPORTS.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.cityName.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || t.categoryKey === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Clean Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Car className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          <span>{dict.badge}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {dict.title}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {dict.subtitle}
        </p>

        {/* Filter Controls */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing: 2 columns mobile, 4 columns desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {filtered.map((item) => {
          const catLabel = dict.categories?.[item.categoryKey] ?? item.categoryDefault;
          return (
            <Card key={item.id} className="group flex flex-col overflow-hidden">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 600px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge variant="outline" className="absolute left-3 top-3 z-10 gap-1 bg-black/40 text-white backdrop-blur-xs shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {catLabel}
                </Badge>
              </div>

              <CardBody className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div className="flex flex-col gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                    {item.name}
                  </h2>

                  <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {item.cityName}
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {item.seats} o'rin
                    </span>
                    <span>·</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {item.hasDriver ? dict.driverIncluded : dict.withoutDriver}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatSum(item.pricePerDaySum)} <span className="text-xs font-normal text-slate-500">/ {dict.perDay}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={`tel:${item.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  >
                    <PhoneCall className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.phone}</span>
                  </a>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold whitespace-nowrap px-3 sm:w-auto"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsSuccess(false);
                    }}
                  >
                    {dict.reserve}
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSuccess ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSuccess(true);
                }}
                className="flex flex-col gap-5"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedItem.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedItem.cityName} · {formatSum(selectedItem.pricePerDaySum)} / {dict.perDay}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Olish kuni</span>
                    <Input type="date" required className="h-10 text-xs font-semibold" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Topshirish kuni</span>
                    <Input type="date" required className="h-10 text-xs font-semibold" />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ismingiz</span>
                  <Input type="text" required placeholder="Masalan: Sardor Alimov" />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Telefon raqamingiz</span>
                  <Input type="tel" required defaultValue="+998" />
                </label>

                <Button type="submit" size="lg" className="mt-2 w-full rounded-2xl bg-blue-600 font-bold text-white shadow-md hover:bg-blue-700">
                  {dict.reserve}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
                  Buyurtmangiz qabul qilindi!
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Operatormiz avtoulov holati va yetkazishni tasdiqlash uchun tez orada siz bilan bog'lanadi.
                </p>

                <div className="mt-6 flex w-full flex-col gap-3">
                  <a
                    href={`tel:${selectedItem.phone.replace(/\s+/g, "")}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Hozir qo'ng'iroq qilish: {selectedItem.phone}</span>
                  </a>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedItem(null)}
                    className="w-full rounded-2xl"
                  >
                    Yopish
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
