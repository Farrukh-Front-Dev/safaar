"use client";

import { Bus } from "lucide-react";

export default function BusBookingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
        <Bus size={32} className="text-[var(--text-muted)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transport bo'limi</h1>
      <p className="text-lg text-[var(--text-muted)]">Tez orada qo'shiladi</p>
    </div>
  );
}
