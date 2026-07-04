import {
  CancellationPolicy,
  ListingStatus,
  PhotoCategory,
  type Listing,
} from "../domain/listing";

/**
 * Demo e'lon — hozircha misol qiymatlar bilan to'ldirilgan.
 * Real backend'da `GET /partner/hotels/:id`'dan keladi.
 */
export const mockListing: Listing = {
  status: ListingStatus.PUBLISHED,

  name: "Hotel Samarkand Plaza",
  shortDescription:
    "Registon markazidan 200 metr uzoqlikda 4 yulduzli zamonaviy mehmonxona.",
  fullDescription:
    "Hotel Samarkand Plaza — tarixiy Registon ansambli yaqinida joylashgan zamonaviy 4 yulduzli mehmonxona. Bizning mehmonxonamizda 30 ta xona, 24 soat resepsiyon, bepul Wi-Fi va parking, hovuz, fitness zal va spa mavjud. Restoran milliy va Yevropa taomlarini taklif etadi. Ertalabki nonushta narxga kiritilgan.\n\nBiznes safari, oilaviy dam olish yoki tarixiy ekskursiyalar uchun ideal joy.",
  stars: 4,

  photos: [
    {
      id: "ph-1",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      caption: "Mehmonxona fasadi",
      category: PhotoCategory.FACADE,
      isCover: true,
      order: 0,
    },
    {
      id: "ph-2",
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
      caption: "Lyuks xona",
      category: PhotoCategory.ROOM,
      isCover: false,
      order: 1,
    },
    {
      id: "ph-3",
      url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      caption: "Standart xona",
      category: PhotoCategory.ROOM,
      isCover: false,
      order: 2,
    },
    {
      id: "ph-4",
      url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
      caption: "Restoran",
      category: PhotoCategory.RESTAURANT,
      isCover: false,
      order: 3,
    },
    {
      id: "ph-5",
      url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80",
      caption: "Hovuz",
      category: PhotoCategory.POOL,
      isCover: false,
      order: 4,
    },
  ],

  amenities: [
    "wifi",
    "wifi_public",
    "tv",
    "breakfast",
    "restaurant",
    "bar",
    "minibar",
    "room_service",
    "pool",
    "gym",
    "spa",
    "reception_24",
    "concierge",
    "laundry",
    "airport_shuttle",
    "parking",
    "elevator",
    "ac",
    "safe",
    "smoke_detector",
    "family_friendly",
  ],

  address: "Samarqand shahri, Registon ko'chasi 5-uy",
  city: "Samarqand",
  latitude: 39.6542,
  longitude: 66.975,
  nearby: [
    { id: "n-1", name: "Registon maydoni", distance: "200 m" },
    { id: "n-2", name: "Bibi-Xonim jomiy masjidi", distance: "800 m" },
    { id: "n-3", name: "Siyob bozori", distance: "1.2 km" },
    { id: "n-4", name: "Samarqand xalqaro aeroporti", distance: "12 km" },
    { id: "n-5", name: "Samarqand temir yo'l vokzali", distance: "8 km" },
  ],

  checkInTime: "14:00",
  checkOutTime: "12:00",
  cancellationPolicy: CancellationPolicy.MODERATE,
  smokingAllowed: false,
  petsAllowed: false,
  childrenAllowed: true,
  extraFees: [
    {
      id: "fee-1",
      name: "Turist soligi",
      amount: 5_000,
      charge: "per_person",
      required: true,
    },
    {
      id: "fee-2",
      name: "Nonushta (qo'shimcha mehmon)",
      amount: 50_000,
      charge: "per_stay",
      required: false,
    },
  ],
};
