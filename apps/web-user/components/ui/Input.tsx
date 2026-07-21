import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-all placeholder:text-slate-500 hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/20 active:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}
