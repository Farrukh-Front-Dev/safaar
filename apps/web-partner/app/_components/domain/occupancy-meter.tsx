import { cn } from "../../_lib/utils/cn";

interface OccupancyMeterProps {
  percent: number;
  className?: string;
}

/**
 * To'liqlik (occupancy) ko'rsatkichi — 0..100%.
 * 80%+ — yashil, 50..79% — sariq, <50% — qizil.
 */
export function OccupancyMeter({ percent, className }: OccupancyMeterProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color =
    clamped >= 80
      ? "bg-accent-500"
      : clamped >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={`To'liqlik: ${clamped}%`}
    >
      <div
        className={cn("h-full transition-all duration-500", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
