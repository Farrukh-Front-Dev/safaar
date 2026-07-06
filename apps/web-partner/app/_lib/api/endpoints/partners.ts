import { request } from "../client";
import type {
  BackendBooking,
  BackendDashboard,
  BackendHotel,
  BackendPage,
  BackendRoom,
} from "../adapters";

export interface PartnerDashboard {
  todayBookings: number;
  monthRevenue: number;
  totalCustomers: number;
  rating: number;
}

/** Hamkor bosh paneli ko'rsatkichlari (`GET /api/partners/dashboard`). */
export function getDashboard(token: string | null): Promise<PartnerDashboard> {
  return request<PartnerDashboard>("/partners/dashboard", { token });
}

export function getRawDashboard(token?: string | null) {
  return request<BackendDashboard>("/partners/dashboard", { token });
}

export function listHotels(token?: string | null) {
  return request<BackendPage<BackendHotel> | BackendHotel[]>("/partners/hotels", {
    token,
  });
}

export function getHotel(id: string, token?: string | null) {
  return request<BackendHotel>(`/partners/hotels/${encodeURIComponent(id)}`, {
    token,
  });
}

export function createHotel(body: Record<string, unknown>, token?: string | null) {
  return request<BackendHotel>("/partners/hotels", {
    method: "POST",
    body,
    token,
  });
}

export function updateHotel(
  id: string,
  body: Record<string, unknown>,
  token?: string | null,
) {
  return request<BackendHotel>(`/partners/hotels/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
    token,
  });
}

export function submitHotelReview(id: string, token?: string | null) {
  return request<BackendHotel>(
    `/partners/hotels/${encodeURIComponent(id)}/submit-review`,
    {
      method: "POST",
      token,
    },
  );
}

export function listRooms(hotelId: string, token?: string | null) {
  return request<BackendRoom[]>(
    `/partners/hotels/${encodeURIComponent(hotelId)}/rooms`,
    { token },
  );
}

export function createRoom(
  hotelId: string,
  body: Record<string, unknown>,
  token?: string | null,
) {
  return request<BackendRoom>(
    `/partners/hotels/${encodeURIComponent(hotelId)}/rooms`,
    {
      method: "POST",
      body,
      token,
    },
  );
}

export function updateRoom(
  hotelId: string,
  roomId: string,
  body: Record<string, unknown>,
  token?: string | null,
) {
  return request<BackendRoom>(
    `/partners/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}`,
    {
      method: "PATCH",
      body,
      token,
    },
  );
}

export function listBookings(token?: string | null) {
  return request<BackendPage<BackendBooking> | BackendBooking[]>(
    "/partners/bookings",
    { token },
  );
}

export function confirmBooking(id: string, token?: string | null) {
  return request<BackendBooking>(
    `/partners/bookings/${encodeURIComponent(id)}/confirm`,
    {
      method: "POST",
      token,
    },
  );
}
