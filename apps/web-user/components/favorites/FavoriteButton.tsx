"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { FavoritesDict } from "@/i18n/dictionaries";
import {
  addFavoriteAction,
  removeFavoriteAction,
} from "@/lib/account/favorites-actions";

/**
 * Sevimli (♥) tugmasi — mehmonxona/avtobus detal sahifasida.
 * Client komponent: holatni saqlaydi va server action'larni chaqiradi.
 */
export function FavoriteButton({
  targetType,
  targetId,
  initialFavoriteId,
  authed,
  loginHref,
  dict,
}: {
  targetType: "hotel" | "bus";
  targetId: string;
  initialFavoriteId: string | null;
  authed: boolean;
  loginHref: string;
  dict: FavoritesDict;
}) {
  const router = useRouter();
  const [favoriteId, setFavoriteId] = useState<string | null>(
    initialFavoriteId,
  );
  const [pending, startTransition] = useTransition();

  const isFavorite = !!favoriteId;
  const label = pending
    ? dict.pending
    : isFavorite
      ? dict.remove
      : authed
        ? dict.add
        : dict.loginRequired;

  function handleClick() {
    if (!authed) {
      router.push(loginHref);
      return;
    }

    startTransition(async () => {
      if (favoriteId) {
        const res = await removeFavoriteAction(favoriteId);
        if (res.ok) {
          setFavoriteId(null);
        } else if (res.authRequired) {
          router.push(loginHref);
        }
      } else {
        const res = await addFavoriteAction(targetType, targetId);
        if (res.ok && res.id) {
          setFavoriteId(res.id);
        } else if (res.authRequired) {
          router.push(loginHref);
        }
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={label}
      title={pending ? dict.pending : label}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isFavorite
          ? "border-primary-200 bg-primary-50 text-primary-600"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      <span aria-hidden>{isFavorite ? "♥" : "♡"}</span>
      <span>{isFavorite ? dict.added : dict.add}</span>
    </button>
  );
}
