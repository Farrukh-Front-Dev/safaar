"use client";

import { Menu } from "lucide-react";
import { useAuthStore } from "../../_stores/auth-store";
import { useLogout } from "../../_hooks/use-auth";
import { useUiStore } from "../../_stores/ui-store";
import { CommandPalette } from "./command-palette";
import { HealthPill } from "./health-pill";
import { NotificationsButton } from "./notifications-button";
import { ThemeToggle } from "./theme-toggle";
import { Tooltip } from "../ui/tooltip";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const openMobileMenu = useUiStore((s) => s.openMobileSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur-md md:px-5">
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip content="Menyu" side="bottom">
          <button
            type="button"
            onClick={openMobileMenu}
            aria-label="Menyu ochish"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-[var(--surface-muted)] md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </Tooltip>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold md:text-base">
            Hotel Samarkand Plaza
          </h1>
          <p className="hidden text-xs text-[var(--muted-foreground)] sm:block">
            Mehmonxona paneli
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <CommandPalette />
        <HealthPill />
        <ThemeToggle />
        <NotificationsButton />
        <UserMenu
          name={user?.fullName ?? "Mehmon"}
          phone={user?.phone ?? "—"}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
