"use client";

import { Bell } from "lucide-react";
import { useAuthStore } from "../../_stores/auth-store";
import { useLogout } from "../../_hooks/use-auth";
import { HealthPill } from "./health-pill";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/85 px-4 backdrop-blur-md md:px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          Mehmonxona paneli
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Hotel Samarkand Plaza
        </p>
      </div>

      <div className="flex items-center gap-2">
        <HealthPill />
        <ThemeToggle />

        <button
          type="button"
          aria-label="Bildirishnomalar"
          className="relative rounded-full p-2 text-zinc-500 transition-colors hover:bg-[var(--surface-muted)]"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
            aria-hidden
          />
        </button>

        <UserMenu
          name={user?.fullName ?? "Mehmon"}
          phone={user?.phone ?? "—"}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
