import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-btn transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-btn-hover focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 active:bg-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
