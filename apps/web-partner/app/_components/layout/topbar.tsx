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

  const partnerType = user?.partnerType || "hotel";
  
  let title = "Hotel Samarkand Plaza";
  let subtitle = "Mehmonxona paneli";
  
  if (partnerType === "dacha") {
    title = "Chorvoq Oasis Dacha";
    subtitle = "Dacha boshqaruv paneli";
  } else if (partnerType === "bus") {
    title = "Safaar Express Trans";
    subtitle = "Tashuvchi (Transport) paneli";
  } else if (partnerType === "hostel") {
    title = "Samarkand Silk Road Hostel";
    subtitle = "Hostel boshqaruv paneli";
  } else if (partnerType === "guesthouse") {
    title = "Buxoro Guesthouse";
    subtitle = "Mehmon uyi paneli";
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 shadow-sm shadow-slate-950/5 md:px-5">
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
            {title}
          </h1>
          <p className="hidden text-xs text-[var(--muted-foreground)] sm:block">
            {subtitle}
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
