"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MapPin, Car, ShieldCheck, Users, PhoneCall, CheckCircle2, X, Calendar, Fuel } from "lucide-react";
import { formatSum } from "@/lib/money";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { CatalogDict } from "@/i18n/dictionaries";
import { CatalogHeader } from "./CatalogHeader";
import { MOCK_TRANSPORTS } from "./data";
import type { TransportItem } from "./types";

export type { TransportItem };

export function TransportView({ dict }: { dict: CatalogDict["transport"] }) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<TransportItem | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeParam && ["rent", "transfer", "vip"].includes(typeParam)) {
      setSelectedCategory(typeParam);
    }
  }, [typeParam]);

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
      <CatalogHeader
        icon={<Car className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
        badge={dict.badge}
        title={dict.title}
        subtitle={dict.subtitle}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={dict.searchPlaceholder}
        filterControls={
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Grid listing */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {filtered.map((item) => {
          const catLabel = dict.categories?.[item.categoryKey] ?? item.categoryDefault;
          return (
            <Card key={item.id} className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge variant="outline" className="absolute left-3 top-3 z-10 gap-1 bg-black/50 text-white backdrop-blur-xs shadow-xs border-white/20">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {catLabel}
                </Badge>
              </div>

              <CardBody className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      {item.name}
                    </h2>
                    <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                      ★ {item.rating}
                    </span>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {item.cityName}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {item.seats} {dict.seats ?? "o'rin"}
                    </span>
                    {item.fuelType && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Fuel className="h-3.5 w-3.5 text-slate-400" />
                          {item.fuelType}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {item.hasDriver ? dict.driverIncluded : dict.withoutDriver}
                    </span>
                  </div>

                  <div className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
                    {formatSum(item.pricePerDaySum)} <span className="text-xs font-normal text-slate-500">/ {dict.perDay}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={`tel:${item.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    <PhoneCall className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.phone}</span>
                  </a>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold whitespace-nowrap px-4 sm:w-auto"
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
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 shrink-0">
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                      {selectedItem.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedItem.cityName} · {formatSum(selectedItem.pricePerDaySum)} / {dict.perDay}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {dict.pickupDate ?? "Olish kuni"}
                    </span>
                    <Input type="date" required className="h-10 text-xs font-semibold" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {dict.returnDate ?? "Topshirish kuni"}
                    </span>
                    <Input type="date" required className="h-10 text-xs font-semibold" />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dict.fullName ?? "Ismingiz"}</span>
                  <Input type="text" required placeholder="Masalan: Jasur Bek" />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dict.phone ?? "Telefon raqamingiz"}</span>
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
                  {dict.successTitle ?? "Buyurtmangiz qabul qilindi!"}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {dict.successDesc ?? "Operatormiz avtoulov holati va yetkazishni tasdiqlash uchun tez orada siz bilan bog'lanadi."}
                </p>

                <div className="mt-6 flex w-full flex-col gap-3">
                  <a
                    href={`tel:${selectedItem.phone.replace(/\s+/g, "")}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>{dict.callNow ?? "Hozir qo'ng'iroq qilish"}: {selectedItem.phone}</span>
                  </a>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedItem(null)}
                    className="w-full rounded-2xl"
                  >
                    {dict.close ?? "Yopish"}
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
