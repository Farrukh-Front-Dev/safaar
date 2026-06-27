"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthTokens, Role } from "@agoda/types";

export interface AuthUser {
  id: string;
  phone: string;
  fullName: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  clearSession: () => void;
  setAccessToken: (accessToken: string) => void;
}

/**
 * Hamkor sessiyasi.
 *
 * NOTE: hozircha tokenlar `localStorage`'da saqlanadi (skelet bosqichi).
 * Production'da `refreshToken`'ni httpOnly cookie'ga ko'chiramiz.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
    setSession: (user, tokens) => set({ user, tokens }),
      clearSession: () => set({ user: null, tokens: null }),
      setAccessToken: (accessToken) =>
        set((state) =>
          state.tokens
            ? { tokens: { ...state.tokens, accessToken } }
            : state,
        ),
    }),
    {
      name: "uzbron-partner-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
