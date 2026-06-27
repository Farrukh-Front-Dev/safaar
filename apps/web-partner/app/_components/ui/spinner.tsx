import { Loader2 } from "lucide-react";
import { cn } from "../../_lib/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Yuklanmoqda"}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Loader2 className={cn("animate-spin", sizes[size])} aria-hidden />
      <span className="sr-only">{label ?? "Yuklanmoqda"}</span>
    </span>
  );
}
