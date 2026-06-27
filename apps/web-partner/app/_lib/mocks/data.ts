import { BookingStatus } from "@agoda/types";
import {
  ReservationSource,
  RoomStatus,
  type FrontDeskStats,
  type GuestProfile,
  type ReservationView,
  type Review,
  type Room,
  type RoomType,
} from "../domain/types";

/**
 * Mehmonxona staff demo ma'lumotlari.
 *
 * Backend tayyor bo'lganda hook'lar real endpoint'larga ulanadi —
 * shu yerdagi mocklar olib tashlanadi.
 */

// ─────────────────────────────────────────────────────────────────────────
// Xona turlari (Standart, Lyuks, Suite)
// ─────────────────────────────────────────────────────────────────────────

export const mockRoomTypes: RoomType[] = [
  {
    id: "rt-std",
    name: "Standart",
    basePrice: 380_000,
    capacity: 2,
    amenities: ["wifi", "tv", "ac"],
  },
  {
    id: "rt-lux",
    name: "Lyuks",
    basePrice: 620_000,
    capacity: 2,
    amenities: ["wifi", "tv", "ac", "minibar", "balcony"],
  },
  {
    id: "rt-fam",
    name: "Family Suite",
    basePrice: 880_000,
    capacity: 4,
    amenities: ["wifi", "tv", "ac", "minibar", "kitchen", "balcony"],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Xonalar (30 ta — 3 qavat × 10 xona)
// ─────────────────────────────────────────────────────────────────────────

const roomStatusCycle: RoomStatus[] = [
  RoomStatus.VACANT_CLEAN,
  RoomStatus.OCCUPIED,
  RoomStatus.VACANT_DIRTY,
  RoomStatus.VACANT_CLEAN,
  RoomStatus.OCCUPIED,
  RoomStatus.OCCUPIED,
  RoomStatus.VACANT_CLEAN,
  RoomStatus.OUT_OF_SERVICE,
  RoomStatus.OCCUPIED,
  RoomStatus.VACANT_CLEAN,
];

const occupantsByRoom: Record<
  string,
  { guestName: string; reservationId: string; checkOut: string }
> = {
  "102": {
    guestName: "Aliyev Sherzod",
    reservationId: "RES-1024",
    checkOut: "2026-07-02",
  },
  "105": {
    guestName: "Karimova Madina",
    reservationId: "RES-1023",
    checkOut: "2026-07-03",
  },
  "106": {
    guestName: "Yusupov Bekzod",
    reservationId: "RES-1019",
    checkOut: "2026-06-30",
  },
  "203": {
    guestName: "Rakhimov Otabek",
    reservationId: "RES-1020",
    checkOut: "2026-07-05",
  },
  "205": {
    guestName: "Tursunova Dilfuza",
    reservationId: "RES-1018",
    checkOut: "2026-07-01",
  },
  "206": {
    guestName: "Saidov Jasur",
    reservationId: "RES-1017",
    checkOut: "2026-06-29",
  },
  "209": {
    guestName: "Mirzayev Bekzod",
    reservationId: "RES-1020",
    checkOut: "2026-07-13",
  },
  "302": {
    guestName: "Olimov Sardor",
    reservationId: "RES-1015",
    checkOut: "2026-07-04",
  },
  "305": {
    guestName: "Hamidova Zarina",
    reservationId: "RES-1016",
    checkOut: "2026-07-06",
  },
  "309": {
    guestName: "Nazarov Botir",
    reservationId: "RES-1014",
    checkOut: "2026-07-02",
  },
};

function buildRooms(): Room[] {
  const rooms: Room[] = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 1; i <= 10; i++) {
      const number = `${floor}${String(i).padStart(2, "0")}`;
      const status = roomStatusCycle[i - 1];
      const typeIdx = i <= 6 ? 0 : i <= 9 ? 1 : 2;
      const type = mockRoomTypes[typeIdx];
      rooms.push({
        id: `room-${number}`,
        number,
        floor,
        roomTypeId: type.id,
        roomTypeName: type.name,
        status,
        occupant:
          status === RoomStatus.OCCUPIED ? occupantsByRoom[number] : undefined,
      });
    }
  }
  return rooms;
}

export const mockRooms: Room[] = buildRooms();

// ─────────────────────────────────────────────────────────────────────────
// Bronlar
// ─────────────────────────────────────────────────────────────────────────

const TODAY = "2026-06-27";
const TOMORROW = "2026-06-28";
const TWO_DAYS = "2026-06-29";
const NEXT_WEEK = "2026-07-04";

export const mockReservations: ReservationView[] = [
  // Bugun keladiganlar (arrivals)
  {
    id: "RES-1031",
    status: BookingStatus.CONFIRMED,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-1",
      fullName: "Aliyev Sherzod",
      phone: "998901234567",
      email: "sherzod@example.uz",
      document: "AA1234567",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    roomNumber: "104",
    checkIn: TODAY,
    checkOut: TWO_DAYS,
    nights: 2,
    adults: 2,
    children: 0,
    totalPrice: 760_000,
    paidAmount: 380_000,
    specialRequests: "Ertalabki nonushta",
    createdAt: "2026-06-20T10:30:00Z",
  },
  {
    id: "RES-1032",
    status: BookingStatus.CONFIRMED,
    source: ReservationSource.PHONE,
    guest: {
      id: "g-2",
      fullName: "Karimova Madina",
      phone: "998912345678",
      email: "madina.k@gmail.com",
    },
    roomTypeId: "rt-lux",
    roomTypeName: "Lyuks",
    roomNumber: "208",
    checkIn: TODAY,
    checkOut: NEXT_WEEK,
    nights: 7,
    adults: 1,
    children: 0,
    totalPrice: 4_340_000,
    paidAmount: 4_340_000,
    createdAt: "2026-06-15T15:00:00Z",
  },
  {
    id: "RES-1033",
    status: BookingStatus.CONFIRMED,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-3",
      fullName: "Tursunov Akmal",
      phone: "998935551122",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    roomNumber: "108",
    checkIn: TODAY,
    checkOut: TOMORROW,
    nights: 1,
    adults: 2,
    children: 1,
    totalPrice: 380_000,
    paidAmount: 0,
    createdAt: "2026-06-26T09:00:00Z",
  },

  // Bugun ketadiganlar (departures)
  {
    id: "RES-1020",
    status: "IN_HOUSE",
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-10",
      fullName: "Rakhimov Otabek",
      phone: "998901112233",
    },
    roomTypeId: "rt-lux",
    roomTypeName: "Lyuks",
    roomNumber: "203",
    checkIn: "2026-06-25",
    checkOut: TODAY,
    nights: 2,
    adults: 2,
    children: 0,
    totalPrice: 1_240_000,
    paidAmount: 1_240_000,
    createdAt: "2026-06-20T12:00:00Z",
  },
  {
    id: "RES-1021",
    status: "IN_HOUSE",
    source: ReservationSource.WALK_IN,
    guest: {
      id: "g-11",
      fullName: "Saidov Jasur",
      phone: "998939998877",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    roomNumber: "206",
    checkIn: "2026-06-26",
    checkOut: TODAY,
    nights: 1,
    adults: 1,
    children: 0,
    totalPrice: 380_000,
    paidAmount: 200_000,
    createdAt: "2026-06-26T18:30:00Z",
  },

  // Hozir mehmonxonada (in-house, kelajakda ketadi)
  {
    id: "RES-1024",
    status: "IN_HOUSE",
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-4",
      fullName: "Yusupov Bekzod",
      phone: "998977778899",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    roomNumber: "106",
    checkIn: "2026-06-26",
    checkOut: "2026-06-30",
    nights: 4,
    adults: 2,
    children: 0,
    totalPrice: 1_520_000,
    paidAmount: 760_000,
    createdAt: "2026-06-20T11:00:00Z",
  },
  {
    id: "RES-1025",
    status: "IN_HOUSE",
    source: ReservationSource.BOOKING_COM,
    guest: {
      id: "g-5",
      fullName: "Mirzayev Bekzod",
      phone: "998901112233",
    },
    roomTypeId: "rt-lux",
    roomTypeName: "Lyuks",
    roomNumber: "209",
    checkIn: "2026-06-25",
    checkOut: "2026-07-13",
    nights: 18,
    adults: 2,
    children: 0,
    totalPrice: 11_160_000,
    paidAmount: 5_580_000,
    createdAt: "2026-06-10T08:00:00Z",
  },

  // Tasdiq kutilmoqda (PENDING)
  {
    id: "RES-1040",
    status: BookingStatus.PENDING,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-20",
      fullName: "Olimova Sevara",
      phone: "998947776655",
    },
    roomTypeId: "rt-fam",
    roomTypeName: "Family Suite",
    checkIn: "2026-07-10",
    checkOut: "2026-07-13",
    nights: 3,
    adults: 2,
    children: 2,
    totalPrice: 2_640_000,
    paidAmount: 0,
    specialRequests: "Bolalar krovati kerak",
    createdAt: "2026-06-27T08:15:00Z",
  },
  {
    id: "RES-1041",
    status: BookingStatus.PENDING,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-21",
      fullName: "Nazarov Botir",
      phone: "998935554433",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    checkIn: "2026-07-15",
    checkOut: "2026-07-16",
    nights: 1,
    adults: 1,
    children: 0,
    totalPrice: 380_000,
    paidAmount: 0,
    createdAt: "2026-06-27T07:40:00Z",
  },
  {
    id: "RES-1042",
    status: BookingStatus.PENDING,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-22",
      fullName: "Ergashev Ulug'bek",
      phone: "998905554433",
    },
    roomTypeId: "rt-lux",
    roomTypeName: "Lyuks",
    checkIn: "2026-07-20",
    checkOut: "2026-07-22",
    nights: 2,
    adults: 2,
    children: 0,
    totalPrice: 1_240_000,
    paidAmount: 620_000,
    createdAt: "2026-06-27T06:55:00Z",
  },

  // Yakunlangan
  {
    id: "RES-1015",
    status: BookingStatus.COMPLETED,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-30",
      fullName: "Hamidova Zarina",
      phone: "998901919191",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    roomNumber: "302",
    checkIn: "2026-06-20",
    checkOut: "2026-06-23",
    nights: 3,
    adults: 1,
    children: 0,
    totalPrice: 1_140_000,
    paidAmount: 1_140_000,
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "RES-1016",
    status: BookingStatus.COMPLETED,
    source: ReservationSource.PHONE,
    guest: {
      id: "g-31",
      fullName: "Olimov Sardor",
      phone: "998935557788",
    },
    roomTypeId: "rt-lux",
    roomTypeName: "Lyuks",
    roomNumber: "305",
    checkIn: "2026-06-18",
    checkOut: "2026-06-22",
    nights: 4,
    adults: 2,
    children: 0,
    totalPrice: 2_480_000,
    paidAmount: 2_480_000,
    createdAt: "2026-06-10T14:00:00Z",
  },

  // Bekor qilingan
  {
    id: "RES-1030",
    status: BookingStatus.CANCELLED,
    source: ReservationSource.UZBRON,
    guest: {
      id: "g-40",
      fullName: "Boboyev Doniyor",
      phone: "998998887766",
    },
    roomTypeId: "rt-std",
    roomTypeName: "Standart",
    checkIn: "2026-06-26",
    checkOut: "2026-06-28",
    nights: 2,
    adults: 2,
    children: 0,
    totalPrice: 760_000,
    paidAmount: 0,
    createdAt: "2026-06-24T16:00:00Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Front Desk KPI (bugungi sana asosida)
// ─────────────────────────────────────────────────────────────────────────

export function buildFrontDeskStats(): FrontDeskStats {
  const occupied = mockRooms.filter(
    (r) => r.status === RoomStatus.OCCUPIED,
  ).length;
  const total = mockRooms.length;
  const arrivals = mockReservations.filter(
    (r) => r.checkIn === TODAY && r.status === BookingStatus.CONFIRMED,
  ).length;
  const departures = mockReservations.filter(
    (r) => r.checkOut === TODAY && r.status === "IN_HOUSE",
  ).length;
  const pending = mockReservations.filter(
    (r) => r.status === BookingStatus.PENDING,
  ).length;
  return {
    occupancyPercent: Math.round((occupied / total) * 100),
    totalRooms: total,
    occupiedRooms: occupied,
    arrivalsToday: arrivals,
    departuresToday: departures,
    pendingReservations: pending,
    monthRevenue: 18_450_000,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Mijozlar
// ─────────────────────────────────────────────────────────────────────────

export const mockGuests: GuestProfile[] = [
  {
    id: "g-1",
    fullName: "Aliyev Sherzod",
    phone: "998901234567",
    email: "sherzod@example.uz",
    totalStays: 4,
    totalSpent: 3_220_000,
    lastStay: TODAY,
    isVip: true,
    tags: ["Biznes", "Takror keladi"],
  },
  {
    id: "g-2",
    fullName: "Karimova Madina",
    phone: "998912345678",
    email: "madina.k@gmail.com",
    totalStays: 7,
    totalSpent: 12_840_000,
    lastStay: TODAY,
    isVip: true,
    tags: ["VIP", "Lyuks afzal ko'radi"],
  },
  {
    id: "g-3",
    fullName: "Tursunov Akmal",
    phone: "998935551122",
    totalStays: 1,
    totalSpent: 380_000,
    lastStay: TODAY,
    isVip: false,
    tags: [],
  },
  {
    id: "g-10",
    fullName: "Rakhimov Otabek",
    phone: "998901112233",
    totalStays: 2,
    totalSpent: 1_540_000,
    lastStay: TODAY,
    isVip: false,
    tags: [],
  },
  {
    id: "g-4",
    fullName: "Yusupov Bekzod",
    phone: "998977778899",
    totalStays: 3,
    totalSpent: 2_140_000,
    lastStay: "2026-06-26",
    isVip: false,
    tags: ["Oilaviy"],
  },
  {
    id: "g-5",
    fullName: "Mirzayev Bekzod",
    phone: "998901112233",
    totalStays: 1,
    totalSpent: 11_160_000,
    lastStay: "2026-06-25",
    isVip: true,
    tags: ["VIP", "Uzoq qoladigan"],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Sharhlar
// ─────────────────────────────────────────────────────────────────────────

export const mockReviews: Review[] = [
  {
    id: "rv-1",
    guestName: "Karimova Madina",
    rating: 5,
    title: "Ajoyib tajriba",
    text: "Xona toza, staff juda samimiy. Ayniqsa nonushta a'lo darajada.",
    createdAt: "2026-06-25",
    reply: "Rahmat, Madina opa! Sizni yana kutib qolamiz.",
  },
  {
    id: "rv-2",
    guestName: "Aliyev Sherzod",
    rating: 4,
    title: "Yaxshi, lekin Wi-Fi sekin",
    text: "Joylashuv juda yaxshi, lekin xonadagi Wi-Fi sekin edi.",
    createdAt: "2026-06-22",
  },
  {
    id: "rv-3",
    guestName: "Yusupova Nigora",
    rating: 5,
    text: "Hammasi a'lo. Yana kelaman.",
    createdAt: "2026-06-20",
    reply: "Rahmat!",
  },
  {
    id: "rv-4",
    guestName: "Doniyor B.",
    rating: 2,
    title: "Konditsioner ishlamadi",
    text: "Xonadagi konditsioner birinchi tunda buzilib qoldi. Boshqasiga ko'chirishdi, lekin noqulay edi.",
    createdAt: "2026-06-18",
  },
  {
    id: "rv-5",
    guestName: "Olimov Sardor",
    rating: 5,
    title: "Mukammal",
    text: "Toza, jim, professional xizmat.",
    createdAt: "2026-06-15",
    reply: "Yuksak baholaganingiz uchun rahmat!",
  },
  {
    id: "rv-6",
    guestName: "Hamidova Zarina",
    rating: 4,
    text: "Umuman olganda yaxshi tajriba.",
    createdAt: "2026-06-12",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Yordamchi
// ─────────────────────────────────────────────────────────────────────────

export function mockDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
