import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind klasslarni xavfsiz birlashtirish (conflict resolver bilan).
 * Misol: cn("p-2", isActive && "bg-brand-600", "p-4") → "bg-brand-600 p-4".
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
