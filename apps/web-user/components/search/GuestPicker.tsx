"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function GuestPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-slate-400 transition-all duration-150 hover:border-blue-300 hover:text-blue-600 active:scale-90 disabled:opacity-30"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={value >= 20}
        className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-slate-400 transition-all duration-150 hover:border-blue-300 hover:text-blue-600 active:scale-90 disabled:opacity-30"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
