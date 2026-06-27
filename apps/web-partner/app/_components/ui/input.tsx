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
        "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm",
        "placeholder:text-zinc-400",
        "focus:border-brand-600 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
