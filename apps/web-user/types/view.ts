/**
 * Front uchun "view-model" turlari.
 *
 * Nega `@agoda/types`'dan to'g'ridan-to'g'ri foydalanmaymiz? Chunki backend
 * qaytaradigan haqiqiy mehmonxona shakli (`city_id`, `rating_average`,
 * ko'p tilli `name`, tiyindagi narx...) `@agoda/types`'dagi soddalashtirilgan
 * `Hotel`ga mos kelmaydi. `@agoda/types`'ni o'zgartirish bizning ishimiz emas
 * (faqat o'qiymiz). Shuning uchun farqni shu view-model'lar va adapterlar bilan
 * yopamiz: API'dan kelgan ma'lumotni UI uchun tayyor, tilga moslangan, so'mga
 * o'tkazilgan ko'rinishga aylantiramiz.
 */

/** Qidiruv selectlari uchun shahar varianti. */
export interface CityOption {
  id: string;
  name: string;
}

/** Qulaylik (amenity) varianti — id va tilga moslangan nom. */
export interface AmenityOption {
  id: string;
  name: string;
}

/** Qidiruv natijalari ro'yxatidagi bitta mehmonxona kartasi. */
export interface HotelListItem {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  stars: number;
  rating: number;
  reviewsCount: number;
  /** Eng arzon xona narxi — **so'm**da (tiyindan o'tkazilgan). */
  minPriceSum: number;
  imageUrl?: string;
}

/** Bitta xona turi (detal sahifasida). */
export interface RoomTypeView {
  id: string;
  name: string;
  /** Narx — **so'm**da. */
  priceSum: number;
  capacity: number;
  available: number;
}

/** Mehmonxona detal sahifasi uchun to'liq ko'rinish. */
export interface HotelDetail extends HotelListItem {
  description: string;
  address: string;
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  rooms: RoomTypeView[];
}

/** To'lov holati (bron tasdiq sahifasida). */
export interface PaymentView {
  status: string;
  provider: string;
  /** Tashqi to'lov sahifasi havolasi (naqd uchun bo'lmaydi). */
  url?: string;
}

/** Bron — tasdiq sahifasi va kabinet uchun ko'rinish. */
export interface BookingView {
  id: string;
  bookingNumber: string;
  /** BookingStatus enum qiymati (masalan "CONFIRMED"). */
  status: string;
  /** "hotel" yoki "bus". */
  type: string;
  /** Jami summa — **so'm**da. */
  totalSum: number;
  currency: "UZS";
  createdAt: string;
  payment?: PaymentView;
}


/* ───────────────────────── Avtobus (bus) ───────────────────────── */

/** Avtobus reysi — qidiruv natijalari va detal sarlavhasi uchun. */
export interface BusTripView {
  id: string;
  fromCity: string;
  toCity: string;
  /** ISO sana-vaqt (UTC). UI'da lokal vaqtga formatlanadi. */
  departureAt: string;
  arrivalAt: string;
  /** Yo'l davomiyligi — daqiqada (route'dan). */
  durationMinutes: number;
  companyName: string;
  /** Kompaniya identifikatori (sharhlar uchun: `/bus-companies/:id/reviews`). */
  companyId: string;
  /** Kompaniya reytingi (0 bo'lishi mumkin). */
  rating: number;
  vehicleName: string;
  /** Eng arzon joy narxi — **so'm**da. */
  minPriceSum: number;
  availableSeats: number;
}

/** Avtobusdagi bitta o'rindiq (joy tanlash uchun). */
export interface BusSeatView {
  id: string;
  /** Ko'rinadigan joy raqami/kodi. */
  code: string;
  seatClass: "standard" | "comfort" | "vip";
  /** Joy narxi — **so'm**da. */
  priceSum: number;
  status: "available" | "held" | "booked" | "blocked";
}

/* ───────────────────────── Kabinet (account) ───────────────────────── */

/** Foydalanuvchi profili — kabinet sahifasi uchun. */
export interface ProfileView {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  /** Ism + familiya (bo'shsa telefon). */
  fullName: string;
  email: string;
  /** Bonus balansi — **so'm**da. */
  bonusBalanceSum: number;
  preferredLanguage: string;
  status: string;
  createdAt: string;
}

/** Bonus balansi va tarix (kabinet "Bonuslar" sahifasi). */
export interface BonusView {
  /** Balans — **so'm**da. */
  balanceSum: number;
  currency: "UZS";
  entries: BonusEntryView[];
}

/** Bonus tarixidagi bitta yozuv. */
export interface BonusEntryView {
  id: string;
  /** Miqdor — **so'm**da (manfiy bo'lishi mumkin: sarflangan). */
  amountSum: number;
  reason: string;
  createdAt: string;
}

/** Sevimli (saqlangan) element — mehmonxona yoki avtobus. */
export interface FavoriteView {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}


/* ───────────────────────── Sharhlar (reviews) ───────────────────────── */

/** Bitta sharh — mehmonxona yoki avtobus kompaniyasi detal sahifasida. */
export interface ReviewView {
  id: string;
  /** Reyting 1..5. */
  rating: number;
  /** Sharh matni. */
  body: string;
  createdAt: string;
}
