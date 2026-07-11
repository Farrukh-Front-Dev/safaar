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
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 max-md:px-3 max-md:py-1.5 max-md:text-xs ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="text-base leading-none max-md:text-xs">{PT_ICONS[type]}</span>
            <span>{labels[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
