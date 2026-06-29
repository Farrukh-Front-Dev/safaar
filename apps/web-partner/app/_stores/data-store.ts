"use client";

import { create } from "zustand";
import { BookingStatus } from "@agoda/types";
import {
  mockGuests,
  mockReservations,
  mockReviews,
  mockRooms,
  TODAY_ISO,
} from "../_lib/mocks/data";
import {
  ReservationSource,
  RoomStatus,
  type FrontDeskStats,
  type GuestProfile,
  type ReservationView,
  type Review,
  type Room,
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

interface DataState {
  reservations: ReservationView[];
  rooms: Room[];
  guests: GuestProfile[];
  reviews: Review[];

  // Reservation mutations
  confirmReservation: (id: string) => void;
  rejectReservation: (id: string) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  addReservation: (draft: WalkInDraft) => ReservationView;

  // Room mutations
  setRoomStatus: (roomId: string, status: RoomStatus) => void;

  // Review mutations
  replyToReview: (reviewId: string, reply: string) => void;

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
  guests: mockGuests,
  reviews: mockReviews,

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
      // Tayinlangan xona OCCUPIED bo'ladi
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
      roomTypeName: "—",
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
              // Status OCCUPIED'dan boshqasi bo'lsa, occupant tozalanadi
              occupant: status === RoomStatus.OCCUPIED ? r.occupant : undefined,
            }
          : r,
      ),
    })),

  replyToReview: (reviewId, reply) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, reply } : r,
      ),
    })),

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
