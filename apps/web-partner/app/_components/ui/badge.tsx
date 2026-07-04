import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../_lib/utils/cn";

type Tone = "neutral" | "brand" | "accent" | "warning" | "danger" | "amber";

const toneClasses: Record<Tone, string> = {
  neutral:
    "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  brand: "bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-800",
  accent:
    "bg-accent-50 text-accent-700 ring-accent-200 dark:bg-accent-900/40 dark:text-accent-200 dark:ring-accent-800",
  warning:
    "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  danger:
    "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

export function Badge({
  className,
  tone = "neutral",
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset shadow-sm shadow-slate-950/5",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {icon && <span className="-ml-0.5 inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
