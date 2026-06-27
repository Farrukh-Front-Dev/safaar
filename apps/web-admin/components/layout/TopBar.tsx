"use client";

import { Bell, Search, LogOut, User } from "lucide-react";
import { currentAdmin } from "@/lib/mock-data";
import { useState, useRef, useEffect } from "react";

export default function TopBar() {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
      {/* Search */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Qidirish... (foydalanuvchi, hamkor, bron)"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-[var(--bg-tertiary)] border border-transparent focus:bg-white focus:border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all duration-200 placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-[var(--border)] mx-2" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-xs font-bold">
              {currentAdmin.fullName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                {currentAdmin.fullName}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] leading-tight">
                {currentAdmin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </span>
            </div>
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[var(--border)] shadow-lg py-2 animate-scale-in z-50">
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">{currentAdmin.fullName}</p>
                <p className="text-xs text-[var(--text-muted)]">{currentAdmin.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                  <User size={16} />
                  Profil sozlamalari
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--danger)] hover:bg-red-50 transition-colors cursor-pointer">
                  <LogOut size={16} />
                  Chiqish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
