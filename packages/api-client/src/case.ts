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
