"use client";

import { create } from "zustand";
import { BookingStatus } from "@agoda/types";
import {
  mockGuests,
  mockReservations,
  mockRoomTypes,
  mockRooms,
  TODAY_ISO,
} from "../_lib/mocks/data";
import {
  ReservationSource,
  RoomStatus,
  type FrontDeskStats,
  type GuestProfile,
  type ReservationView,
  type Room,
  type RoomType,
} from "../_lib/domain/types";

export interface WalkInDraft {
  fullName: string;
  phone: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  nights: number;
  totalPrice: number;
}

export interface RoomTypeDraft {
  name: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
}

export interface RoomDraft {
  number: string;
  floor: number;
  roomTypeId: string;
}

export interface BulkRoomsDraft {
  floor: number;
  /** Boshlanish raqami, masalan 101 */
  startNumber: number;
  count: number;
  roomTypeId: string;
}

interface DataState {
  reservations: ReservationView[];
  rooms: Room[];
  roomTypes: RoomType[];
  guests: GuestProfile[];

  // Reservation mutations
  confirmReservation: (id: string) => void;
  rejectReservation: (id: string) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  addReservation: (draft: WalkInDraft) => ReservationView;

  // Room status (housekeeping)
  setRoomStatus: (roomId: string, status: RoomStatus) => void;

  // Room type CRUD
  addRoomType: (draft: RoomTypeDraft) => RoomType;
  updateRoomType: (id: string, draft: RoomTypeDraft) => void;
  deleteRoomType: (id: string) => { ok: boolean; reason?: string };

  // Room CRUD
  addRoom: (draft: RoomDraft) => { ok: boolean; reason?: string; room?: Room };
  updateRoom: (id: string, draft: RoomDraft) => { ok: boolean; reason?: string };
  deleteRoom: (id: string) => { ok: boolean; reason?: string };
  bulkAddRooms: (draft: BulkRoomsDraft) => {
    ok: boolean;
    reason?: string;
    added: number;
  };

  // Computed
  getStats: () => FrontDeskStats;
}

/**
 * Mehmonxona staff demo ma'lumot ombori.
 *
 * Barcha tugmalar shu omborga yozadi va UI bir zumda yangilanadi.
 * Backend tayyor bo'lsa, har bir mutation real `request()` chaqirig'iga
 * almashtiriladi (TanStack Query mutations bilan).
 */
export const useDataStore = create<DataState>((set, get) => ({
  reservations: mockReservations,
  rooms: mockRooms,
  roomTypes: mockRoomTypes,
  guests: mockGuests,

  confirmReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: BookingStatus.CONFIRMED } : r,
      ),
    })),

  rejectReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: BookingStatus.CANCELLED } : r,
      ),
    })),

  checkIn: (id) =>
    set((state) => {
      const reservation = state.reservations.find((r) => r.id === id);
      const reservations = state.reservations.map((r) =>
        r.id === id ? { ...r, status: "IN_HOUSE" as const } : r,
      );
      const rooms = reservation?.roomNumber
        ? state.rooms.map((rm) =>
            rm.number === reservation.roomNumber
              ? {
                  ...rm,
                  status: RoomStatus.OCCUPIED,
                  occupant: {
                    guestName: reservation.guest.fullName,
                    reservationId: reservation.id,
                    checkOut: reservation.checkOut,
                  },
                }
              : rm,
          )
        : state.rooms;
      return { reservations, rooms };
    }),

  checkOut: (id) =>
    set((state) => {
      const reservation = state.reservations.find((r) => r.id === id);
      const reservations = state.reservations.map((r) =>
        r.id === id ? { ...r, status: BookingStatus.COMPLETED } : r,
      );
      const rooms = reservation?.roomNumber
        ? state.rooms.map((rm) =>
            rm.number === reservation.roomNumber
              ? {
                  ...rm,
                  status: RoomStatus.VACANT_DIRTY,
                  occupant: undefined,
                }
              : rm,
          )
        : state.rooms;
      return { reservations, rooms };
    }),

  addReservation: (draft) => {
    const id = `RES-${Date.now().toString().slice(-4)}`;
    const roomType = get().roomTypes.find((rt) => rt.id === draft.roomTypeId);
    const reservation: ReservationView = {
      id,
      status: BookingStatus.CONFIRMED,
      source: ReservationSource.WALK_IN,
      guest: {
        id: `g-walkin-${id}`,
        fullName: draft.fullName,
        phone: draft.phone,
      },
      roomTypeId: draft.roomTypeId,
      roomTypeName: roomType?.name ?? "—",
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      nights: draft.nights,
      adults: draft.adults,
      children: draft.children,
      totalPrice: draft.totalPrice,
      paidAmount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ reservations: [reservation, ...state.reservations] }));
    return reservation;
  },

  setRoomStatus: (roomId, status) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status,
              occupant: status === RoomStatus.OCCUPIED ? r.occupant : undefined,
            }
          : r,
      ),
    })),

  addRoomType: (draft) => {
    const id = `rt-${Date.now().toString(36)}`;
    const roomType: RoomType = { id, ...draft };
    set((state) => ({ roomTypes: [...state.roomTypes, roomType] }));
    return roomType;
  },

  updateRoomType: (id, draft) =>
    set((state) => ({
      roomTypes: state.roomTypes.map((rt) =>
        rt.id === id ? { ...rt, ...draft } : rt,
      ),
      // Bog'liq xonalarda turi nomini yangilash
      rooms: state.rooms.map((r) =>
        r.roomTypeId === id ? { ...r, roomTypeName: draft.name } : r,
      ),
    })),

  deleteRoomType: (id) => {
    const state = get();
    const inUse = state.rooms.some((r) => r.roomTypeId === id);
    if (inUse) {
      return {
        ok: false,
        reason: "Bu turdan foydalanayotgan xonalar bor. Avval ularni o'chiring yoki boshqa turga ko'chiring.",
      };
    }
    set({ roomTypes: state.roomTypes.filter((rt) => rt.id !== id) });
    return { ok: true };
  },

  addRoom: (draft) => {
    const state = get();
    if (state.rooms.some((r) => r.number === draft.number)) {
      return { ok: false, reason: `Xona ${draft.number} allaqachon mavjud.` };
    }
    const roomType = state.roomTypes.find((rt) => rt.id === draft.roomTypeId);
    if (!roomType) {
      return { ok: false, reason: "Xona turi topilmadi." };
    }
    const room: Room = {
      id: `room-${draft.number}`,
      number: draft.number,
      floor: draft.floor,
      roomTypeId: draft.roomTypeId,
      roomTypeName: roomType.name,
      status: RoomStatus.VACANT_CLEAN,
    };
    set({ rooms: [...state.rooms, room] });
    return { ok: true, room };
  },

  updateRoom: (id, draft) => {
    const state = get();
    const existing = state.rooms.find((r) => r.id === id);
    if (!existing) return { ok: false, reason: "Xona topilmadi." };
    if (
      draft.number !== existing.number &&
      state.rooms.some((r) => r.number === draft.number)
    ) {
      return { ok: false, reason: `Xona ${draft.number} allaqachon mavjud.` };
    }
    if (existing.status === RoomStatus.OCCUPIED) {
      return {
        ok: false,
        reason: "Bu xonada mehmon bor. Avval check-out qiling.",
      };
    }
    const roomType = state.roomTypes.find((rt) => rt.id === draft.roomTypeId);
    if (!roomType) {
      return { ok: false, reason: "Xona turi topilmadi." };
    }
    set({
      rooms: state.rooms.map((r) =>
        r.id === id
          ? {
              ...r,
              number: draft.number,
              floor: draft.floor,
              roomTypeId: draft.roomTypeId,
              roomTypeName: roomType.name,
            }
          : r,
      ),
    });
    return { ok: true };
  },

  deleteRoom: (id) => {
    const state = get();
    const room = state.rooms.find((r) => r.id === id);
    if (!room) return { ok: false, reason: "Xona topilmadi." };
    if (room.status === RoomStatus.OCCUPIED) {
      return {
        ok: false,
        reason: "Bu xonada mehmon bor. Avval check-out qiling.",
      };
    }
    set({ rooms: state.rooms.filter((r) => r.id !== id) });
    return { ok: true };
  },

  bulkAddRooms: (draft) => {
    const state = get();
    const roomType = state.roomTypes.find((rt) => rt.id === draft.roomTypeId);
    if (!roomType) return { ok: false, reason: "Xona turi topilmadi.", added: 0 };
    if (draft.count <= 0 || draft.count > 200) {
      return { ok: false, reason: "Soni 1–200 oralig'ida bo'lishi kerak.", added: 0 };
    }

    const newRooms: Room[] = [];
    const conflicts: string[] = [];

    for (let i = 0; i < draft.count; i++) {
      const number = String(draft.startNumber + i);
      if (
        state.rooms.some((r) => r.number === number) ||
        newRooms.some((r) => r.number === number)
      ) {
        conflicts.push(number);
        continue;
      }
      newRooms.push({
        id: `room-${number}`,
        number,
        floor: draft.floor,
        roomTypeId: draft.roomTypeId,
        roomTypeName: roomType.name,
        status: RoomStatus.VACANT_CLEAN,
      });
    }

    if (newRooms.length === 0) {
      return {
        ok: false,
        reason: `Barcha raqamlar allaqachon mavjud: ${conflicts.join(", ")}`,
        added: 0,
      };
    }

    set({ rooms: [...state.rooms, ...newRooms] });
    return {
      ok: true,
      added: newRooms.length,
      ...(conflicts.length > 0
        ? { reason: `O'tkazib yuborilgan (mavjud): ${conflicts.join(", ")}` }
        : {}),
    };
  },

  getStats: () => {
    const { reservations, rooms } = get();
    const today = TODAY_ISO;
    const occupied = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
    const total = rooms.length;
    const arrivals = reservations.filter(
      (r) => r.checkIn === today && r.status === BookingStatus.CONFIRMED,
    ).length;
    const departures = reservations.filter(
      (r) => r.checkOut === today && r.status === "IN_HOUSE",
    ).length;
    const pending = reservations.filter(
      (r) => r.status === BookingStatus.PENDING,
    ).length;
    return {
      occupancyPercent: total ? Math.round((occupied / total) * 100) : 0,
      totalRooms: total,
      occupiedRooms: occupied,
      arrivalsToday: arrivals,
      departuresToday: departures,
      pendingReservations: pending,
      monthRevenue: 18_450_000,
    };
  },
}));
