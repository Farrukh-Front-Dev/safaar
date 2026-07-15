import { BookingStatus } from "@agoda/types";
import { RoomStatus } from "../domain/types";
import type {
  Room,
  FrontDeskStats,
  ReservationSource,
  ReservationView,
  RoomType,
} from "../domain/types";
import {
  CancellationPolicy,
  ListingStatus,
  PhotoCategory,
  type Listing,
} from "../domain/listing";

type Localized = string | { uz?: string; ru?: string; en?: string } | null | undefined;

export interface BackendPage<T> {
  items?: T[];
  data?: T[];
  total?: number;
}

export interface BackendHotel {
  id: string;
  slug?: string;
  name?: Localized;
  description?: Localized;
  address?: string;
  city?: string;
  city_id?: string;
  latitude?: number;
  longitude?: number;
  stars?: number;
  status?: string;
  amenities?: string[];
  images?: string[];
  check_in_time?: string;
  check_out_time?: string;
}

export interface BackendRoom {
  id: string;
  code?: string;
  name?: Localized;
  base_occupancy?: number;
  max_adults?: number;
  max_children?: number;
  total_inventory?: number;
  base_price?: number;
  status?: string;
}

export interface BackendBooking {
  id: string;
  status?: string;
  check_in?: string;
  check_out?: string;
  total_amount?: number;
  currency?: string;
  payment_method?: string;
  guest_name?: string;
  guest_phone?: string;
  customer_name?: string;
  customer_phone?: string;
  room_type_name?: string;
  room_number?: string;
  item?: {
    check_in?: string;
    check_out?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    nights?: number;
  };
  created_at?: string;
}

export interface BackendDashboard {
  today_bookings?: number;
  todayBookings?: number;
  month_revenue?: number;
  monthRevenue?: number;
  total_customers?: number;
  totalCustomers?: number;
  rating?: number;
  occupied_rooms?: number;
  total_rooms?: number;
}

function localized(value: Localized, fallback = ""): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.uz ?? value.en ?? value.ru ?? fallback;
}

export function pageItems<T>(value: T[] | BackendPage<T>): T[] {
  if (Array.isArray(value)) return value;
  return value.items ?? value.data ?? [];
}

export function toListing(hotel: BackendHotel): Listing {
  return {
    name: localized(hotel.name, "Mehmonxona"),
    shortDescription: localized(hotel.description),
    fullDescription: localized(hotel.description),
    status:
      hotel.status === "published"
        ? ListingStatus.PUBLISHED
        : hotel.status === "pending_review"
          ? ListingStatus.UNDER_REVIEW
          : hotel.status === "hidden"
            ? ListingStatus.HIDDEN
            : ListingStatus.DRAFT,
    address: hotel.address ?? "",
    city: hotel.city ?? hotel.city_id ?? "",
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    stars: hotel.stars ?? 3,
    checkInTime: hotel.check_in_time ?? "14:00",
    checkOutTime: hotel.check_out_time ?? "12:00",
    amenities: hotel.amenities ?? [],
    photos:
      hotel.images?.map((url, index) => ({
        id: `${hotel.id}-photo-${index}`,
        url,
        caption: localized(hotel.name, "Mehmonxona rasmi"),
        category: PhotoCategory.OTHER,
        isCover: index === 0,
        order: index,
      })) ?? [],
    nearby: [],
    cancellationPolicy: CancellationPolicy.MODERATE,
    smokingAllowed: false,
    petsAllowed: false,
    childrenAllowed: true,
    extraFees: [],
  };
}

export function toRoom(room: BackendRoom): Room {
  return {
    id: room.id,
    roomTypeId: room.id, // Using room.id as roomTypeId is temporary, the backend returns real relations
    number: room.code ?? `R-${room.id.substring(0, 4)}`,
    floor: 1, // Assume floor 1 for now if missing
    status: room.status === "active" ? RoomStatus.VACANT_CLEAN : RoomStatus.VACANT_CLEAN,
    roomTypeName: localized(room.name, "Xona"),
    isListed: true,
  };
}

export function toRoomType(room: BackendRoom): RoomType {
  return {
    id: room.id,
    name: localized(room.name, room.code ?? "Xona"),
    description: room.code ?? "",
    capacity: room.max_adults ?? room.base_occupancy ?? 2,
    bedType: "Standart",
    sizeSqm: 24,
    basePrice: room.base_price ?? 0,
    amenities: [],
    imageUrl: undefined,
  };
}

export function toReservation(booking: BackendBooking): ReservationView {
  const checkIn = booking.check_in ?? booking.item?.check_in ?? "";
  const checkOut = booking.check_out ?? booking.item?.check_out ?? "";
  return {
    id: booking.id,
    status: normalizeBookingStatus(booking.status),
    guest: {
      id: `${booking.id}-guest`,
      fullName: booking.guest_name ?? booking.customer_name ?? "Mehmon",
      phone: booking.guest_phone ?? booking.customer_phone ?? "",
      email: "",
    },
    roomTypeId: booking.id,
    roomTypeName: booking.room_type_name ?? "Xona",
    roomNumber: booking.room_number,
    checkIn,
    checkOut,
    nights: booking.item?.nights ?? 1,
    adults: booking.item?.adults ?? 1,
    children: booking.item?.children ?? 0,
    totalPrice: booking.total_amount ?? 0,
    paidAmount: 0,
    source: "UZBRON" as ReservationSource,
    createdAt: booking.created_at ?? new Date().toISOString(),
  };
}

export function toFrontDeskStats(dashboard: BackendDashboard): FrontDeskStats {
  const totalRooms = dashboard.total_rooms ?? 0;
  const occupiedRooms = dashboard.occupied_rooms ?? 0;
  return {
    occupancyPercent:
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    occupiedRooms,
    totalRooms,
    arrivalsToday: dashboard.today_bookings ?? dashboard.todayBookings ?? 0,
    departuresToday: 0,
    pendingReservations: 0,
    monthRevenue: dashboard.month_revenue ?? dashboard.monthRevenue ?? 0,
  };
}

function normalizeBookingStatus(status?: string): BookingStatus {
  const value = status?.toUpperCase();
  if (value && value in BookingStatus) {
    return BookingStatus[value as keyof typeof BookingStatus];
  }
  return BookingStatus.PENDING;
}
