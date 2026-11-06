/**
 * Booking checkout: creates the booking and a Stripe Checkout Session.
 *
 *   POST /api/checkout
 *
 * ── Three fixes against the previous version ──────────────────────────
 *
 *  1. AUTH BYPASS. It fell back to `body.userId` when token verification
 *     failed, so anyone could create a booking in another user's name.
 *     Identity now comes only from a verified ID token.
 *
 *  2. DOUBLE PAYOUT. It set `payment_intent_data.transfer_data.destination`,
 *     a destination charge that pays the chef at capture, while the payout
 *     cron later transferred the same money again. The charge is now taken on
 *     the platform account and released once, after the event, by
 *     `/api/stripe/payout/release`. That is what "funds held in escrow until
 *     after the event" actually requires.
 *
 *  3. FREE BOOKINGS. When the Stripe call threw, it returned a fake session
 *     pointing at `/user-dashboard?booking_success=true`, marking a booking
 *     successful with no payment taken. That fallback now exists only outside
 *     production, and the booking is left unpaid either way.
 */

import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAuth, toErrorResponse, ValidationError } from '@/lib/auth/server-auth'
import { toMajor, toMinor, platformFeePercent } from '@/lib/money'

export const dynamic = 'force-dynamic'

/** Deposits are only offered for events far enough out to be worth staging. */
const DEPOSIT_WINDOW_MS = 5 * 7 * 24 * 60 * 60 * 1000
const DEPOSIT_FRACTION = 0.2

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json().catch(() => {
      throw new ValidationError('Request body must be valid JSON.')
    })

    const {
      chefId,
      chefName,
      chefSlug,
      eventDate,
      eventTime,
      durationHours,
      guestCount,
      eventType,
      specialRequests,
      location,
      depositOnly,
    } = body as Record<string, unknown>

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // ── 1. Price from the chef's own rate ─────────────────────────────
    let hourlyRateMajor = 120
    let chefCurrency = 'GBP'

    if (typeof chefId === 'string' && chefId) {
      try {
        const chefSnap = await adminDb.collection(COLLECTIONS.CHEFS).doc(chefId).get()
        if (chefSnap.exists) {
          const data = chefSnap.data() ?? {}
          hourlyRateMajor = Number(data.hourlyRate ?? data.hourly_rate ?? data.rate ?? 120)
          chefCurrency = String(data.currency ?? 'GBP').toUpperCase()
        }
      } catch (err) {
        console.error('[checkout] chef lookup failed:', err)
      }
    }

    const duration = Math.max(1, Number(durationHours) || 3)
    const subtotalMinor = toMinor(hourlyRateMajor) * duration

    // The guest pays the service fee on top of the chef's rate, so the chef
    // receives their full hourly rate. `splitFee` is used for the ledger view.
    const feePercent = platformFeePercent()
    const platformFeeMinor = Math.round((subtotalMinor * feePercent) / 100)
    const totalMinor = subtotalMinor + platformFeeMinor

    const eventTimestamp = new Date(String(eventDate ?? Date.now())).getTime()
    const isFarAhead =
      Number.isFinite(eventTimestamp) && eventTimestamp - Date.now() > DEPOSIT_WINDOW_MS
    const takingDeposit = Boolean(depositOnly) && isFarAhead
    const chargeMinor = takingDeposit ? Math.round(totalMinor * DEPOSIT_FRACTION) : totalMinor

    // ── 2. Record the booking before taking money ─────────────────────
    const bookingRef = adminDb.collection(COLLECTIONS.BOOKINGS).doc()

    await bookingRef.set({
      client_id: user.uid,
      user_id: user.uid,
      chef_id: typeof chefId === 'string' && chefId ? chefId : null,
      chef_name: chefName ?? null,
      chef_slug: chefSlug ?? chefId ?? null,
      event_date: String(eventDate ?? new Date().toISOString().slice(0, 10)),
      event_time: String(eventTime ?? '19:00'),
      duration_hours: duration,
      guest_count: Math.max(1, Number(guestCount) || 2),
      event_type: eventType ?? 'Private Dinner',
      special_requests: specialRequests ?? null,
      location: location ?? null,
      currency: chefCurrency,
      // Money is written in major units to match existing production documents.
      subtotal: toMajor(subtotalMinor),
      platform_fee: toMajor(platformFeeMinor),
      total_price: toMajor(totalMinor),
      total_amount: toMajor(totalMinor),
      chef_payout: toMajor(subtotalMinor),
      deposit_amount: takingDeposit ? toMajor(chargeMinor) : null,
      is_deposit: takingDeposit,
      remaining_balance: takingDeposit ? toMajor(totalMinor - chargeMinor) : 0,
      status: 'pending_payment',
      payment_status: 'pending',
      // NOT 'held' yet: nothing is in escrow until the client actually pays.
      // The Stripe webhook promotes this to 'held' on a completed session.
      payout_status: 'unpaid',
      payout_attempt: 0,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    })

    // ── 3. Stripe Checkout Session ────────────────────────────────────
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: typeof body.email === 'string' ? body.email : (user.email ?? undefined),
      line_items: [
        {
          price_data: {
            currency: chefCurrency.toLowerCase(),
            product_data: {
              name: `${chefName ?? 'Private chef'} booking (${duration} hours)`,
              description: `Private culinary event on ${String(eventDate ?? 'your selected date')} for ${Number(guestCount) || 2} guests${takingDeposit ? ' (20% deposit)' : ''}`,
            },
            unit_amount: chargeMinor,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingRef.id,
        clientId: user.uid,
        chefId: typeof chefId === 'string' ? chefId : '',
        depositOnly: takingDeposit ? 'true' : 'false',
        totalMinor: String(totalMinor),
      },
      // No transfer_data: the charge settles into the PLATFORM balance and is
      // transferred to the chef only after the event. See src/lib/stripe/escrow.ts.
      payment_intent_data: {
        metadata: { bookingId: bookingRef.id },
      },
      success_url: `${origin}/user-dashboard?booking_success=true&booking_id=${bookingRef.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/${typeof chefSlug === 'string' ? chefSlug : (chefId ?? '')}?canceled=true&booking_id=${bookingRef.id}`,
    }

    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create(params)
    } catch (err) {
      console.error('[checkout] Stripe session creation failed:', err)

      // In production, a Stripe failure must surface as a failure. Pretending
      // the booking succeeded is what previously let bookings through unpaid.
      await bookingRef.update({
        status: 'payment_failed',
        payment_status: 'failed',
        updated_at: FieldValue.serverTimestamp(),
      })

      return NextResponse.json(
        {
          success: false,
          error: 'We could not start the payment. Your card has not been charged. Please try again.',
          bookingId: bookingRef.id,
        },
        { status: 502 },
      )
    }

    await bookingRef.update({
      stripe_session_id: session.id,
      updated_at: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      bookingId: bookingRef.id,
      amountDue: toMajor(chargeMinor),
      currency: chefCurrency,
      breakdown: {
        subtotal: toMajor(subtotalMinor),
        platformFee: toMajor(platformFeeMinor),
        total: toMajor(totalMinor),
        feePercent,
        // The guest pays the fee on top, so the chef receives the full subtotal.
        chefReceives: toMajor(subtotalMinor),
      },
    })
  } catch (error) {
    return toErrorResponse(error, 'checkout POST')
  }
}
