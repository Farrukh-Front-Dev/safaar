"use client";

import { PT_TYPES, PT_ICONS } from "./constants";
import type { PropertyType } from "./types";

interface Props {
  activeType: PropertyType;
  onChange: (type: PropertyType) => void;
  labels: Record<PropertyType, string>;
}

export function PropertyTypeTabs({ activeType, onChange, labels }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {PT_TYPES.map((type) => {
        const isActive = activeType === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 sm:px-4 sm:py-2 sm:text-sm ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="text-xs leading-none sm:text-base">{PT_ICONS[type]}</span>
            <span className="hidden sm:inline">{labels[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
