/**
 * Backend `snake_case` javoblarini frontga qulay `camelCase`ga aylantirish.
 *
 * Backend (NestJS) maydonlarni `snake_case`da qaytaradi (`city_id`,
 * `rating_average`...), front esa `camelCase` ishlatadi. Bu farqni bitta joyda,
 * API client qatlamida yopamiz — sahifalarda takror normalizatsiya bo'lmasin.
 */

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Obyekt/massiv kalitlarini chuqur (deep) `camelCase`ga o'tkazadi.
 * Massiv elementlari va ichki obyektlar ham qayta ishlanadi.
 * Sana satrlari, oddiy qiymatlar o'zgarmaydi.
 */
export function camelizeKeys<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => camelizeKeys(item)) as T;
  }

  if (input !== null && typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, Json>)) {
      result[snakeToCamel(key)] = camelizeKeys(value);
    }
    return result as T;
  }

  return input as T;
}
