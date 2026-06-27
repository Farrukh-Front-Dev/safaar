import { Star } from "lucide-react";
import { cn } from "../../_lib/utils/cn";

interface StarRatingProps {
  value: number;
  max?: number;
  className?: string;
  size?: number;
}

/** Faqat o'qish uchun yulduz reytingi (0..max). */
export function StarRating({
  value,
  max = 5,
  className,
  size = 16,
}: StarRatingProps) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} dan ${max} yulduz`}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i < rounded
              ? "fill-amber-400 stroke-amber-400"
              : "fill-transparent stroke-zinc-300 dark:stroke-zinc-600"
          }
          aria-hidden
        />
      ))}
    </span>
  );
}
