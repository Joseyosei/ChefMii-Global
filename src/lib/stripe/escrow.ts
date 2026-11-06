/**
 * Escrow and payout logic.
 *
 * SERVER ONLY.
 *
 * ── Why this file replaces the previous arrangement ───────────────────
 *
 * The platform advertises "100% Escrow Protection: funds are held until after
 * the event". Two incompatible mechanisms were implemented at once:
 *
 *   1. `/api/checkout` created a Stripe *destination charge*
 *      (`payment_intent_data.transfer_data.destination`), which transfers the
 *      money to the chef's connected account at the moment the client pays.
 *   2. `/api/stripe/payout/release` then ran a cron that found the same
 *      booking (status `confirmed`, payout_status `held`) and called
 *      `stripe.transfers.create` for it.
 *
 * So every booking taken through checkout with a connected chef paid that chef
 * TWICE: once at capture and once at release. It also was not escrow at all,
 * because the funds had already left the platform.
 *
 * The model implemented here is "separate charge and transfer", which is what
 * escrow actually requires:
 *
 *   - the charge is taken on the PLATFORM account, with no transfer_data, so
 *     the money sits in the ChefMii balance
 *   - after the event date, `releasePayout` creates ONE transfer to the chef's
 *     connected account and records it in the `payouts` ledger
 *
 * ── The second bug this fixes ─────────────────────────────────────────
 *
 * The old release handler marked a booking `payout_status: 'released'` from
 * inside the `catch` block of a failed `transfers.create`. The chef had not
 * been paid, but the system recorded that they had, and the booking would
 * never be picked up again. Here a failure is recorded as `failed` with the
 * reason, and remains eligible for a retry.
 */

import type Stripe from 'stripe'
import { FieldValue, type Transaction } from 'firebase-admin/firestore'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { splitFee, toMinor, DEFAULT_CURRENCY } from '@/lib/money'
import type { PayoutRecord, PayoutStatus } from '@/types/onboarding'

export interface ReleaseOutcome {
  bookingId: string
  status: PayoutStatus
  transferId: string | null
  netAmountMinor: number
  reason: string | null
}

/**
 * Release escrowed funds for one booking.
 *
 * Idempotent in two layers:
 *   - a Firestore transaction claims the booking by moving it to `releasing`,
 *     so two concurrent cron runs cannot both pay out
 *   - the Stripe call carries an idempotency key derived from the booking id,
 *     so a retry after a network timeout cannot create a second transfer
 */
export async function releasePayout(bookingId: string): Promise<ReleaseOutcome> {
  const bookingRef = adminDb.collection(COLLECTIONS.BOOKINGS).doc(bookingId)

  // ── 1. Claim the booking ────────────────────────────────────────────
  const claim = await adminDb.runTransaction(async (tx: Transaction) => {
    const snap = await tx.get(bookingRef)
    if (!snap.exists) {
      return { ok: false as const, reason: 'Booking no longer exists.' }
    }

    const b = snap.data() ?? {}
    const payoutStatus = (b.payout_status as string) ?? 'unpaid'

    if (payoutStatus === 'released') {
      return { ok: false as const, reason: 'Already released.' }
    }
    if (payoutStatus === 'releasing') {
      return { ok: false as const, reason: 'Another release is already in progress.' }
    }
    if (payoutStatus === 'reversed') {
      return { ok: false as const, reason: 'Payment was refunded, nothing to release.' }
    }
    if (b.payment_status !== 'paid') {
      return { ok: false as const, reason: 'Client has not paid for this booking.' }
    }

    tx.update(bookingRef, {
      payout_status: 'releasing',
      updated_at: FieldValue.serverTimestamp(),
    })

    return {
      ok: true as const,
      chefId: (b.chef_id as string) ?? null,
      // Stored in major units by the existing booking writers.
      totalAmountMajor: Number(b.total_amount ?? b.total_price ?? 0),
      platformFeeMajor: Number(b.platform_fee ?? 0),
      currency: ((b.currency as string) || DEFAULT_CURRENCY).toUpperCase(),
      attempt: Number(b.payout_attempt ?? 0) + 1,
    }
  })

  if (!claim.ok) {
    return {
      bookingId,
      status: 'held',
      transferId: null,
      netAmountMinor: 0,
      reason: claim.reason,
    }
  }

  const { chefId, totalAmountMajor, platformFeeMajor, currency, attempt } = claim

  // ── 2. Work out what is owed ────────────────────────────────────────
  const grossMinor = toMinor(totalAmountMajor)
  const platformFeeMinor =
    platformFeeMajor > 0 ? toMinor(platformFeeMajor) : splitFee(grossMinor).platformFeeMinor
  const netAmountMinor = Math.max(0, grossMinor - platformFeeMinor)

  // ── 3. Find the chef's connected account ────────────────────────────
  let stripeAccountId: string | null = null
  if (chefId) {
    try {
      const chefSnap = await adminDb.collection(COLLECTIONS.CHEFS).doc(chefId).get()
      stripeAccountId =
        (chefSnap.data()?.stripeAccountId as string) ??
        (chefSnap.data()?.stripe_account_id as string) ??
        null
    } catch (err) {
      console.error('[escrow] chef lookup failed for', chefId, err)
    }
  }

  if (!stripeAccountId) {
    return finalise({
      bookingId,
      chefId,
      stripeAccountId: null,
      grossMinor,
      platformFeeMinor,
      netAmountMinor,
      currency,
      attempt,
      status: 'failed',
      transferId: null,
      // Deliberately NOT marked released. The chef has no payout destination,
      // so the money must stay in escrow until they connect one.
      reason: 'Chef has not completed Stripe Connect onboarding, so there is nowhere to send the funds.',
    })
  }

  if (netAmountMinor <= 0) {
    return finalise({
      bookingId,
      chefId,
      stripeAccountId,
      grossMinor,
      platformFeeMinor,
      netAmountMinor,
      currency,
      attempt,
      status: 'failed',
      transferId: null,
      reason: 'Nothing to pay out: the net amount is zero.',
    })
  }

  // ── 4. Transfer ─────────────────────────────────────────────────────
  try {
    const transfer = await stripe.transfers.create(
      {
        amount: netAmountMinor,
        currency: currency.toLowerCase(),
        destination: stripeAccountId,
        metadata: { bookingId, chefId: chefId ?? '', attempt: String(attempt) },
      },
      {
        // Keyed on the booking, not the attempt, so a retried network call for
        // the same release can never produce a second transfer.
        idempotencyKey: `payout_${bookingId}`,
      },
    )

    return finalise({
      bookingId,
      chefId,
      stripeAccountId,
      grossMinor,
      platformFeeMinor,
      netAmountMinor,
      currency,
      attempt,
      status: 'released',
      transferId: transfer.id,
      reason: null,
    })
  } catch (err) {
    const reason = describeStripeError(err)
    console.error(`[escrow] transfer failed for booking ${bookingId}:`, err)

    return finalise({
      bookingId,
      chefId,
      stripeAccountId,
      grossMinor,
      platformFeeMinor,
      netAmountMinor,
      currency,
      attempt,
      status: 'failed',
      transferId: null,
      reason,
    })
  }
}

interface FinaliseArgs {
  bookingId: string
  chefId: string | null
  stripeAccountId: string | null
  grossMinor: number
  platformFeeMinor: number
  netAmountMinor: number
  currency: string
  attempt: number
  status: Extract<PayoutStatus, 'released' | 'failed'>
  transferId: string | null
  reason: string | null
}

/**
 * Write the ledger row and reconcile the booking.
 *
 * A failed attempt returns the booking to `held` so the next sweep retries it.
 * It is never recorded as released.
 */
async function finalise(args: FinaliseArgs): Promise<ReleaseOutcome> {
  const {
    bookingId,
    chefId,
    stripeAccountId,
    grossMinor,
    platformFeeMinor,
    netAmountMinor,
    currency,
    attempt,
    status,
    transferId,
    reason,
  } = args

  const ledgerRow: Omit<PayoutRecord, 'id' | 'createdAt' | 'releasedAt'> = {
    bookingId,
    chefId: chefId ?? '',
    stripeAccountId,
    grossAmountMinor: grossMinor,
    platformFeeMinor,
    netAmountMinor,
    currency,
    status,
    stripeTransferId: transferId,
    failureReason: reason,
    attempt,
  }

  const batch = adminDb.batch()

  batch.set(adminDb.collection(COLLECTIONS.PAYOUTS).doc(), {
    ...ledgerRow,
    createdAt: FieldValue.serverTimestamp(),
    releasedAt: status === 'released' ? FieldValue.serverTimestamp() : null,
  })

  batch.update(adminDb.collection(COLLECTIONS.BOOKINGS).doc(bookingId), {
    payout_status: status === 'released' ? 'released' : 'held',
    payout_attempt: attempt,
    payout_last_error: reason,
    ...(status === 'released'
      ? {
          stripe_transfer_id: transferId,
          chef_payout: netAmountMinor / 100,
          status: 'completed',
          released_at: FieldValue.serverTimestamp(),
        }
      : {}),
    updated_at: FieldValue.serverTimestamp(),
  })

  await batch.commit()

  return { bookingId, status, transferId, netAmountMinor, reason }
}

/** Turn a Stripe error into something an operator can act on. */
function describeStripeError(err: unknown): string {
  const e = err as Stripe.errors.StripeError | undefined

  if (e?.code === 'balance_insufficient') {
    return 'Platform Stripe balance is too low to cover this payout. Top up the balance and retry.'
  }
  if (e?.type === 'StripeInvalidRequestError' && /capab/i.test(e.message ?? '')) {
    return 'The platform account is missing the transfers capability, or the chef account cannot receive transfers.'
  }
  if (e?.message) return e.message
  return 'Stripe rejected the transfer.'
}

/**
 * Bookings whose escrow is due for release: paid, event date passed, funds
 * still held.
 *
 * Returns ids only. Each is then released individually so one failure does not
 * abort the rest of the sweep.
 */
export async function findReleasableBookings(limit = 100): Promise<string[]> {
  const todayIso = new Date().toISOString().slice(0, 10)

  try {
    const snap = await adminDb
      .collection(COLLECTIONS.BOOKINGS)
      .where('payout_status', '==', 'held')
      .limit(limit * 3)
      .get()

    return snap.docs
      .filter((doc) => {
        const b = doc.data()
        if (b.payment_status !== 'paid') return false
        const eventDate = String(b.event_date ?? '').slice(0, 10)
        return Boolean(eventDate) && eventDate <= todayIso
      })
      .slice(0, limit)
      .map((doc) => doc.id)
  } catch (err) {
    console.error('[escrow] releasable booking query failed:', err)
    return []
  }
}
