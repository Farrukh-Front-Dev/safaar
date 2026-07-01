import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../_lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm",
        "transition-colors duration-150",
        "placeholder:text-zinc-400",
        "hover:border-[var(--border-strong)]",
        "focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900",
        "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-200 dark:aria-[invalid=true]:focus:ring-red-900",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
