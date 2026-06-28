/**
 * Tailwind klasslarini shartli birlashtirish uchun kichik yordamchi.
 * Tashqi bog'liqliksiz (clsx/cn o'rniga) — keraksiz paket qo'shmaymiz.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
