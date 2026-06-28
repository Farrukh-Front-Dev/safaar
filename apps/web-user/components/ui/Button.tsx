import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  accent: "bg-accent-600 text-white hover:bg-accent-700 shadow-sm",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Yuklanish holati: spinner ko'rsatadi, tugmani o'chiradi (aria-busy). */
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0a4 4 0 0 0-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
