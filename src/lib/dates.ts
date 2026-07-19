/** Normalize Firestore / serialized date values to epoch milliseconds. */
export function toMillis(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const ts = value as {
    toMillis?: () => number;
    toDate?: () => Date;
    seconds?: number;
    nanoseconds?: number;
  };
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.toDate === "function") {
    const d = ts.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : null;
  }
  if (typeof ts.seconds === "number") {
    return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
  }
  return null;
}

/** Convert any supported date shape to a Date, or null if unusable. */
export function toDate(value: unknown): Date | null {
  const ms = toMillis(value);
  if (ms == null) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO string for API/UI serialization; undefined when value is missing/invalid. */
export function toIsoString(value: unknown): string | undefined {
  const d = toDate(value);
  return d ? d.toISOString() : undefined;
}
