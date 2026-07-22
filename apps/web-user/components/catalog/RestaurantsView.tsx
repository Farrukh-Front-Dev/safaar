"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  MapPin,
  Star,
  Utensils,
  Clock,
  PhoneCall,
  X,
  CheckCircle2,
  Calendar,
  Users,
  User,
  Phone,
} from "lucide-react";
import { formatSum } from "@/lib/money";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { CatalogDict } from "@/i18n/dictionaries";

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

const FALLBACK_DICT: CatalogDict["restaurants"] = {
  badge: "Milliy va Xalqaro Oshxona",
  title: "Restoranlar va Milliy Taomlar",
  subtitle: "O'zbekistonning eng saralangan restoranlari, milliy oshxonalar va shinam choyxonalari.",
  searchPlaceholder: "Restoran nomi yoki taom turi bo'yicha qidiruv...",
  allCities: "Barcha shaharlar",
  avgCheck: "Chek",
  reserveTable: "Stol band qilish",
  modalTitle: "Stol band qilish",
  guests: "Kishilar soni",
  date: "Sana",
  time: "Vaqt",
  fullName: "Ismingiz",
  phone: "Telefon raqamingiz",
  confirm: "Band qilishni tasdiqlash",
  successTitle: "Stolingiz muvaffaqiyatli band qilindi!",
  successDesc: "Restoran ma'muriyati bandlikni tasdiqlash uchun tez orada siz bilan bog'lanadi.",
  callNow: "Hozir qo'ng'iroq qilish",
  close: "Yopish",
};

export function RestaurantsView({ dict = FALLBACK_DICT }: { dict?: CatalogDict["restaurants"] }) {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);

  // Reservation form state
  const [guestCount, setGuestCount] = useState(2);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("18:00");
  const [fullName, setFullName] = useState("");
  const [phoneInput, setPhoneInput] = useState("+998");
  const [isSuccess, setIsSuccess] = useState(false);

  const filtered = MOCK_RESTAURANTS.filter((r) => {
    const matchesQuery =
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(query.toLowerCase());
    const matchesCity =
      selectedCity === "all" || r.cityName.toLowerCase() === selectedCity.toLowerCase();
    return matchesQuery && matchesCity;
  });

  function handleOpenModal(restaurant: RestaurantItem) {
    setSelectedRestaurant(restaurant);
    setIsSuccess(false);
    setGuestCount(2);
  }

  function handleCloseModal() {
    setSelectedRestaurant(null);
    setIsSuccess(false);
  }

  function handleReserveSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSuccess(true);
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Clean Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Utensils className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          <span>{dict.badge}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {dict.title}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {dict.subtitle}
        </p>

        {/* Filters */}
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
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-xs transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">{dict.allCities}</option>
            <option value="Toshkent">Toshkent</option>
            <option value="Samarqand">Samarqand</option>
            <option value="Buxoro">Buxoro</option>
            <option value="Xiva">Xiva</option>
          </select>
        </div>
      </div>

      {/* Grid listing: 2 columns mobile, 4 columns desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {filtered.map((item) => (
          <Card key={item.id} className="group flex flex-col overflow-hidden">
            {/* Aspect Ratio Container for Image */}
            <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge variant="outline" className="absolute left-3 top-3 z-10 gap-1 text-amber-700 shadow-xs">
                <Star className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden />
                {item.rating.toFixed(1)}
              </Badge>
            </div>

            <CardBody className="flex flex-1 flex-col justify-between p-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {item.cuisine}
                  </span>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {item.cityName} · {item.address}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {item.workingHours}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {dict.avgCheck}: {formatSum(item.averageCheckSum)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
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
                  onClick={() => handleOpenModal(item)}
                >
                  {dict.reserveTable}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Interactive Table Reservation Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSuccess ? (
              <form onSubmit={handleReserveSubmit} className="flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={selectedRestaurant.imageUrl}
                      alt={selectedRestaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedRestaurant.cityName} · {selectedRestaurant.cuisine}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      {dict.guests}
                    </span>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} kishi
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      {dict.date}
                    </span>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="h-10 text-xs font-semibold"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    {dict.time}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["12:00", "14:00", "18:00", "19:30", "20:30"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                          time === t
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    {dict.fullName}
                  </span>
                  <Input
                    type="text"
                    required
                    placeholder="Masalan: Jasur Rahimov"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    {dict.phone}
                  </span>
                  <Input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                </label>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 w-full rounded-2xl bg-blue-600 font-bold text-white shadow-md hover:bg-blue-700"
                >
                  {dict.confirm}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
                  {dict.successTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {dict.successDesc}
                </p>

                <div className="mt-6 flex w-full flex-col gap-3">
                  <a
                    href={`tel:${selectedRestaurant.phone.replace(/\s+/g, "")}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>{dict.callNow}: {selectedRestaurant.phone}</span>
                  </a>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    className="w-full rounded-2xl"
                  >
                    {dict.close}
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
