/**
 * Money handling.
 *
 * All arithmetic happens in minor units (pence, cents) as integers. Floats are
 * never used for money: `150.10 * 3` is `450.29999999999995` in JavaScript, and
 * that error reaches a Stripe charge or a chef's payout.
 *
 * Firestore stores booking amounts in MAJOR units today (`total_amount: 450`),
 * so conversion happens at the boundary via `toMinor` / `toMajor` rather than
 * by changing live documents.
 */

export const DEFAULT_CURRENCY = 'GBP'

/** Platform commission, as a percentage. Matches the 10% advertised on the site. */
export function platformFeePercent(): number {
  const raw = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT)
  if (Number.isFinite(raw) && raw >= 0 && raw <= 100) return raw
  return 10
}

/** Major units to minor units. `12.34` -> `1234`. */
export function toMinor(major: number): number {
  return Math.round(major * 100)
}

/** Minor units to major units. `1234` -> `12.34`. */
export function toMajor(minor: number): number {
  return Math.round(minor) / 100
}

export interface FeeBreakdown {
  /** What the client pays, in minor units. */
  grossMinor: number
  /** ChefMii's commission, in minor units. */
  platformFeeMinor: number
  /** What the chef receives, in minor units. */
  netMinor: number
  feePercent: number
}

/**
 * Split a gross amount into platform fee and chef payout.
 * The fee is rounded and the net is the remainder, so the two always sum
 * exactly back to gross and no penny is created or lost.
 */
export function splitFee(grossMinor: number, feePercent = platformFeePercent()): FeeBreakdown {
  const gross = Math.max(0, Math.round(grossMinor))
  const platformFeeMinor = Math.round((gross * feePercent) / 100)
  return {
    grossMinor: gross,
    platformFeeMinor,
    netMinor: gross - platformFeeMinor,
    feePercent,
  }
}

/** Price a booking from an hourly rate in major units. */
export function priceBooking(
  hourlyRateMajor: number,
  durationHours: number,
  feePercent = platformFeePercent(),
): FeeBreakdown {
  const grossMinor = toMinor(hourlyRateMajor) * Math.max(1, Math.round(durationHours))
  return splitFee(grossMinor, feePercent)
}

const CURRENCY_LOCALES: Record<string, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'de-DE',
  AED: 'ar-AE',
}

/**
 * Format minor units for display.
 *
 * Note: the older `formatPrice` in `src/lib/utils.ts` defaults to USD with an
 * en-US locale even though the platform prices in GBP. Prefer this function
 * for anything new.
 */
export function formatMinor(minor: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(toMajor(minor))
}

/** Format major units for display. */
export function formatMajor(major: number, currency = DEFAULT_CURRENCY): string {
  return formatMinor(toMinor(major), currency)
}
