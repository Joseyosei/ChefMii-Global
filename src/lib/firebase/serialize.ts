/**
 * Firestore value normalisation.
 *
 * Firestore returns `Timestamp` objects, which are not JSON-serialisable and
 * will throw when passed from a Server Component to a Client Component. Every
 * read path converts timestamps to ISO strings through `toIso()`.
 */

interface TimestampLike {
  toDate: () => Date
}

function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as TimestampLike).toDate === 'function'
  )
}

/**
 * Convert a Firestore Timestamp, Date, or date-ish string into an ISO string.
 * Returns `fallback` for null, undefined and unparseable values.
 */
export function toIso(value: unknown, fallback: string | null = null): string | null {
  if (value == null) return fallback

  if (isTimestampLike(value)) {
    try {
      return value.toDate().toISOString()
    } catch {
      return fallback
    }
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value.toISOString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString()
  }

  // Firestore REST shape: { _seconds, _nanoseconds }
  if (typeof value === 'object' && value !== null && '_seconds' in value) {
    const seconds = (value as { _seconds: number })._seconds
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toISOString()
    }
  }

  return fallback
}

/** `toIso` that is guaranteed to return a string. Defaults to the epoch. */
export function toIsoRequired(value: unknown): string {
  return toIso(value) ?? new Date(0).toISOString()
}

/** Coerce to a finite number, or return `fallback`. */
export function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback
}

/** Coerce to a string array, dropping non-strings. */
export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string')
}
