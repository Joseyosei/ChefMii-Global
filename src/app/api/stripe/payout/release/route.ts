/**
 * Escrow release sweep.
 *
 *   POST /api/stripe/payout/release
 *   headers: x-api-key: $CRON_SECRET   (or Authorization: Bearer $CRON_SECRET)
 *
 * Finds bookings whose event date has passed and whose funds are still held,
 * then releases each one through `releasePayout`.
 *
 * Two bugs from the previous version are fixed here:
 *
 *  1. AUTH. The old check was `if (apiKey && apiKey !== secret) reject`, so a
 *     request with NO key at all passed straight through and anyone could
 *     trigger payouts. `requireCronAuth` now requires a matching secret.
 *
 *  2. FALSE SUCCESS. The old handler marked bookings `payout_status:
 *     'released'` inside the catch block of a failed transfer, so a chef who
 *     had not been paid was recorded as paid and never retried. Release state
 *     now comes from the actual Stripe result.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireCronAuth, toErrorResponse } from '@/lib/auth/server-auth'
import { findReleasableBookings, releasePayout, type ReleaseOutcome } from '@/lib/stripe/escrow'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { formatMinor } from '@/lib/money'
import { sendPayoutReleased } from '@/lib/email/notifications'

export const dynamic = 'force-dynamic'
/** Transfers are sequential; give the sweep room without hitting the limit. */
export const maxDuration = 60

/**
 * Vercel Cron invokes scheduled endpoints with GET, so both verbs run the same
 * sweep. Both require the cron secret.
 */
export async function GET(request: NextRequest) {
  return runSweep(request)
}

export async function POST(request: NextRequest) {
  return runSweep(request)
}

async function runSweep(request: NextRequest) {
  try {
    requireCronAuth(request)

    const bookingIds = await findReleasableBookings(100)

    const outcomes: ReleaseOutcome[] = []
    for (const bookingId of bookingIds) {
      // Sequential on purpose: concurrent transfers against one platform
      // balance make `balance_insufficient` failures much harder to reason about.
      outcomes.push(await releasePayout(bookingId))
    }

    const released = outcomes.filter((o) => o.status === 'released')
    const failed = outcomes.filter((o) => o.status === 'failed')
    const skipped = outcomes.filter((o) => o.status === 'held')

    // Notify paid chefs. Best-effort, never blocks the sweep.
    void Promise.allSettled(
      released.map(async (outcome) => {
        try {
          const bookingSnap = await adminDb
            .collection(COLLECTIONS.BOOKINGS)
            .doc(outcome.bookingId)
            .get()
          const chefId = bookingSnap.data()?.chef_id as string | undefined
          if (!chefId) return

          const chefSnap = await adminDb.collection(COLLECTIONS.USERS).doc(chefId).get()
          const email = chefSnap.data()?.email as string | undefined
          if (!email) return

          await sendPayoutReleased({
            to: email,
            name: (chefSnap.data()?.full_name as string) ?? 'Chef',
            amountFormatted: formatMinor(outcome.netAmountMinor),
            bookingRef: outcome.bookingId,
          })
        } catch (err) {
          console.error('[payout/release] notification failed:', err)
        }
      }),
    )

    return NextResponse.json({
      success: true,
      message: `Checked ${bookingIds.length} booking(s). Released ${released.length}, failed ${failed.length}, skipped ${skipped.length}.`,
      examined: bookingIds.length,
      releasedCount: released.length,
      released: released.map((o) => ({
        bookingId: o.bookingId,
        transferId: o.transferId,
        amount: formatMinor(o.netAmountMinor),
      })),
      // Failures stay in escrow and are retried on the next sweep.
      failures: failed.map((o) => ({ bookingId: o.bookingId, reason: o.reason })),
      skipped: skipped.map((o) => ({ bookingId: o.bookingId, reason: o.reason })),
    })
  } catch (error) {
    return toErrorResponse(error, 'stripe/payout/release POST')
  }
}
