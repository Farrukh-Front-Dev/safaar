import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}

export default function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        "transition-colors duration-150",
        className
      )}
      style={{
        color: color ?? "var(--text-secondary)",
        backgroundColor: bg ?? "var(--bg-tertiary)",
      }}
    >
      {children}
    </span>
  );
}
