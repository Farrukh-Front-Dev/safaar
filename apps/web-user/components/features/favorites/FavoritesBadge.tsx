"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function FavoritesBadge({
  locale,
  count = 0,
  light = false,
}: {
  locale: string;
  count?: number;
  light?: boolean;
}) {
  const [favCount, setFavCount] = useState(count);

  useEffect(() => {
    function handleStorageChange() {
      try {
        const stored = localStorage.getItem("safaar_favorites_count");
        if (stored !== null) {
          setFavCount(Number(stored));
        }
      } catch {}
    }

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("safaar_favorites_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("safaar_favorites_updated", handleStorageChange);
    };
  }, []);

  return (
    <Link
      href={`/${locale}/account/favorites`}
      title="Saralanganlar / Favorites"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 ${
        light
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          : "border border-white/40 bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <Heart className="h-4 w-4 fill-current text-rose-500" />
      {favCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs">
          {favCount}
        </span>
      )}
    </Link>
  );
}
