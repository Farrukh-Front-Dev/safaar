import type { HTMLAttributes } from "react";
import { cn } from "../../_lib/utils/cn";

type Tone = "neutral" | "brand" | "accent" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  brand: "bg-brand-100 text-brand-800",
  accent: "bg-accent-100 text-accent-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
