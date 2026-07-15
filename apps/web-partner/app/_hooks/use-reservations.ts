"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { pageItems, toReservation } from "../_lib/api/adapters";
import { partners } from "../_lib/api";
import { useDataStore } from "../_stores/data-store";
import { useAuthStore } from "../_stores/auth-store";

/**
 * Bronlar ro'yxati — store'dan reaktiv.
 * Backend tayyor bo'lsa, `useQuery` bilan almashtiriladi.
 */
export function useReservations() {
  const data = useDataStore((s) => s.reservations);
  const setReservations = useDataStore((s) => s.setReservations);
  const query = useQuery({
    queryKey: ["partner", "bookings"],
    queryFn: async () => {
      try {
        return pageItems(await partners.listBookings()).map(toReservation);
      } catch {
        return data;
      }
    },
  });

  useEffect(() => {
    if (query.data) setReservations(query.data);
  }, [query.data, setReservations]);

  return {
    data,
    isLoading: query.isLoading && data.length === 0,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/** Bitta bron tafsiloti. */
export function useReservation(id: string) {
  const reservations = useReservations();
  const data = reservations.data.find((r) => r.id === id) ?? null;
  return { data, isLoading: reservations.isLoading };
}

export function useConfirmReservation() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const confirmLocal = useDataStore((s) => s.confirmReservation);
  return useMutation({
    mutationFn: async (id: string) => {
      await partners.confirmBooking(id, accessToken);
      return id;
    },
    onSuccess: (id) => confirmLocal(id),
  });
}

export function useRejectReservation() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const rejectLocal = useDataStore((s) => s.rejectReservation);
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await partners.rejectBooking(id, reason, accessToken);
      return id;
    },
    onSuccess: (id) => rejectLocal(id),
  });
}

export function useCheckIn() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const checkInLocal = useDataStore((s) => s.checkIn);
  return useMutation({
    mutationFn: async (id: string) => {
      await partners.checkIn(id, accessToken);
      return id;
    },
    onSuccess: (id) => checkInLocal(id),
  });
}

export function useAssignRoom() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const assignRoomLocal = useDataStore((s) => s.assignRoom);
  return useMutation({
    mutationFn: async ({ id, roomNumber }: { id: string; roomNumber: string }) => {
      await partners.assignRoom(id, roomNumber, accessToken);
      return { id, roomNumber };
    },
    onSuccess: ({ id, roomNumber }) => assignRoomLocal(id, roomNumber),
  });
}

export function useCheckOut() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const checkOutLocal = useDataStore((s) => s.checkOut);
  return useMutation({
    mutationFn: async (id: string) => {
      await partners.checkOut(id, accessToken);
      return id;
    },
    onSuccess: (id) => checkOutLocal(id),
  });
}
