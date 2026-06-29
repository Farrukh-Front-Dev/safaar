import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm hover:bg-primary-500 hover:shadow-md active:bg-primary-700 active:shadow-none active:scale-[0.97] transition-all duration-150",
  accent:
    "bg-accent-600 text-white shadow-sm hover:bg-accent-500 hover:shadow-md active:bg-accent-700 active:shadow-none active:scale-[0.97] transition-all duration-150",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 active:scale-[0.97] transition-all duration-150",
  ghost:
    "text-slate-700 hover:bg-slate-100 active:bg-slate-200 active:scale-[0.97] transition-all duration-150",
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
        "inline-flex items-center justify-center gap-2 rounded-full font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
