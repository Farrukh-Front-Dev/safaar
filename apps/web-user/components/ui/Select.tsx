import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
