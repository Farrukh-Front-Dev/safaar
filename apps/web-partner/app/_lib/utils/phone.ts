/**
 * "+998 90 123 45 67" → "998901234567" (faqat raqamlar).
 */
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * "+998 __ ___ __ __" maskasiga moslab formatlash.
 * Input: foydalanuvchi har xil shaklda yozishi mumkin.
 */
export function maskPhone(input: string): string {
  const digits = normalizePhone(input).replace(/^998/, "");
  const chunks: string[] = ["+998"];
  if (digits.length > 0) chunks.push(digits.slice(0, 2));
  if (digits.length > 2) chunks.push(digits.slice(2, 5));
  if (digits.length > 5) chunks.push(digits.slice(5, 7));
  if (digits.length > 7) chunks.push(digits.slice(7, 9));
  return chunks.join(" ");
}

/** O'zbekiston telefoni 12 raqam (998XXXXXXXXX). */
export function isValidPhone(input: string): boolean {
  return /^998\d{9}$/.test(normalizePhone(input));
}
