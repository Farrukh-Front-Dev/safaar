export function corsOriginsFromEnv(value: string | undefined) {
  if (!value || value.trim() === '*') {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
