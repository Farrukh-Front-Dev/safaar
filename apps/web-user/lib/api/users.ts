/**
 * Kabinet endpointlari (`/me`, USER, himoyalangan). Backend `users.controller.ts`.
 * Himoyalangan — sessiyadan dev auth headerlari yuboriladi (`devAuthHeaders`).
 */
import { api } from "@/lib/api";
import { camelizeKeys } from "@/lib/case";
import { devAuthHeaders, type Session } from "@/lib/auth/session";
import { toBookingView } from "@/lib/adapters/booking";
import {
  toBonusView,
  toFavoriteView,
  toProfileView,
} from "@/lib/adapters/user";
import type {
  BonusView,
  BookingView,
  FavoriteView,
  ProfileView,
} from "@/types/view";

/** `GET /me` — joriy foydalanuvchi profili. */
export async function getProfile(session: Session): Promise<ProfileView> {
  const raw = await api.get<unknown>("/me", {
    headers: devAuthHeaders(session),
    cache: "no-store",
  });
  return toProfileView(camelizeKeys(raw));
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/** `PATCH /me` — profilni yangilash. */
export async function updateProfile(
  session: Session,
  input: UpdateProfileInput,
): Promise<ProfileView> {
  const raw = await api.patch<unknown>(
    "/me",
    {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
    },
    { headers: devAuthHeaders(session) },
  );
  return toProfileView(camelizeKeys(raw));
}

/** `GET /me/bookings` — foydalanuvchi bronlari. */
export async function getMyBookings(session: Session): Promise<BookingView[]> {
  const raw = await api.get<unknown>("/me/bookings", {
    headers: devAuthHeaders(session),
    cache: "no-store",
  });
  const items = camelizeKeys<unknown[]>(raw);
  return (items ?? []).map((item) => toBookingView(item as never));
}

/** `GET /me/favorites` — sevimlilar ro'yxati. */
export async function getFavorites(session: Session): Promise<FavoriteView[]> {
  const raw = await api.get<unknown>("/me/favorites", {
    headers: devAuthHeaders(session),
    cache: "no-store",
  });
  const items = camelizeKeys<unknown[]>(raw);
  return (items ?? []).map((item) => toFavoriteView(item as never));
}

/** `GET /me/bonuses` — bonus balansi va tarixi. */
export async function getBonuses(session: Session): Promise<BonusView> {
  const raw = await api.get<unknown>("/me/bonuses", {
    headers: devAuthHeaders(session),
    cache: "no-store",
  });
  return toBonusView(camelizeKeys(raw));
}


export interface AddFavoriteInput {
  targetType: "hotel" | "bus";
  targetId: string;
}

/** `POST /me/favorites` — sevimliga qo'shish (yaratilgan yozuvni qaytaradi). */
export async function addFavorite(
  session: Session,
  input: AddFavoriteInput,
): Promise<FavoriteView> {
  const raw = await api.post<unknown>(
    "/me/favorites",
    { target_type: input.targetType, target_id: input.targetId },
    { headers: devAuthHeaders(session) },
  );
  return toFavoriteView(camelizeKeys(raw));
}

/** `DELETE /me/favorites/:id` — sevimlidan olib tashlash. */
export async function removeFavorite(
  session: Session,
  favoriteId: string,
): Promise<void> {
  await api.delete<unknown>(
    `/me/favorites/${encodeURIComponent(favoriteId)}`,
    { headers: devAuthHeaders(session) },
  );
}

/**
 * Berilgan obyekt (mehmonxona/avtobus) sevimlilar ro'yxatida bormi —
 * mavjud bo'lsa favorite id'sini qaytaradi (detal sahifasida holatni
 * aniqlash uchun). Sessiya yo'q bo'lsa `null`.
 */
export async function findFavoriteId(
  session: Session,
  targetId: string,
): Promise<string | null> {
  const favorites = await getFavorites(session).catch(() => []);
  return favorites.find((f) => f.targetId === targetId)?.id ?? null;
}