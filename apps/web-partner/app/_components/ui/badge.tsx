import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../_lib/utils/cn";

type Tone = "neutral" | "brand" | "accent" | "warning" | "danger" | "amber";

const toneClasses: Record<Tone, string> = {
  neutral:
    "text-zinc-500",
  brand: "text-brand-600",
  accent:
    "text-accent-600",
  warning:
    "text-amber-600",
  amber: "text-amber-600",
  danger:
    "text-red-600",
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
        "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider",
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
