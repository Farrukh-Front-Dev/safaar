import type { HTMLAttributes } from "react";
import { cn } from "../../_lib/utils/cn";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
