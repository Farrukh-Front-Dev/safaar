import type { LabelHTMLAttributes } from "react";
import { cn } from "../../_lib/utils/cn";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-[var(--foreground)]", className)}
      {...props}
    />
  );
}
