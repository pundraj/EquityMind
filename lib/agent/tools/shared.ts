export function extractTickersFromText(text: string): string[] {
  const matches = text.match(/\b[A-Z]{1,5}\b/g) ?? [];
  return [...new Set(matches.filter((ticker) => ticker.length >= 1))];
}

export function compact(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
