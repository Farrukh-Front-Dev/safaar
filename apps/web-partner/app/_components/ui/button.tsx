import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../_lib/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Yuklanmoqda holati — spinner ko'rsatadi va o'chirib qo'yadi. */
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-sm shadow-brand-900/15 hover:from-brand-500 hover:to-brand-700 active:from-brand-700 active:to-brand-800 disabled:from-brand-300 disabled:to-brand-300 disabled:text-white/80 disabled:shadow-none",
  secondary:
    "bg-gradient-to-b from-accent-500 to-accent-600 text-white shadow-sm shadow-accent-900/10 hover:from-accent-400 hover:to-accent-600 active:from-accent-600 active:to-accent-700 disabled:from-accent-300 disabled:to-accent-300",
  outline:
    "border border-[var(--border-strong)] bg-[var(--panel-gradient)] text-[var(--foreground)] shadow-sm shadow-slate-950/5 hover:border-brand-300 hover:bg-[var(--surface-hover)] active:bg-[var(--surface-muted)] dark:hover:border-brand-700",
  ghost:
    "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-muted)]",
  subtle:
    "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
  danger:
    "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm shadow-red-900/10 hover:from-red-500 hover:to-red-700 active:from-red-600 active:to-red-800 disabled:from-red-300 disabled:to-red-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  icon: "h-9 w-9",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    type = "button",
    loading,
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "hover:-translate-y-px active:translate-y-0 active:scale-[0.99]",
        "disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
});
