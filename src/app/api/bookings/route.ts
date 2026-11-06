/**
 * Direct booking with an inline PaymentIntent (used by the on-page card form).
 *
 *   POST /api/bookings
 *   GET  /api/bookings    the caller's own bookings
 *
 * SECURITY FIX: the previous version verified the ID token inside a try/catch,
 * logged a warning on failure, then fell back to `body.userId`. An
 * unauthenticated caller could therefore create bookings attributed to any
 * uid. Identity now comes only from a verified token.
 *
 * Like `/api/checkout`, the charge is taken on the platform account with no
 * `transfer_data`, so funds are genuinely held until `/api/stripe/payout/release`
 * transfers them after the event.
 */

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAuth, toErrorResponse, ValidationError } from '@/lib/auth/server-auth'
import { platformFeePercent, toMajor, toMinor } from '@/lib/money'
import { toIso } from '@/lib/firebase/serialize'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json().catch(() => {
      throw new ValidationError('Request body must be valid JSON.')
    })

    const {
      chefSlug,
      chefId: inputChefId,
      eventDate,
      eventTime,
      durationHours,
      guestCount,
      eventType,
      specialRequests,
      address,
    } = body as Record<string, unknown>

    // ── Resolve the chef and their rate ───────────────────────────────
    let chefId: string | null = typeof inputChefId === 'string' ? inputChefId : null
    let hourlyRateMajor = 120
    let currency = 'GBP'

    try {
      if (typeof chefSlug === 'string' && chefSlug) {
        const bySlug = await adminDb
          .collection(COLLECTIONS.CHEFS)
          .where('slug', '==', chefSlug)
          .limit(1)
          .get()
        if (!bySlug.empty) {
          const doc = bySlug.docs[0]
          chefId = doc.id
          hourlyRateMajor = Number(doc.data().hourlyRate ?? doc.data().hourly_rate ?? 120)
          currency = String(doc.data().currency ?? 'GBP').toUpperCase()
        }
      } else if (chefId) {
        const byId = await adminDb.collection(COLLECTIONS.CHEFS).doc(chefId).get()
        if (byId.exists) {
          hourlyRateMajor = Number(byId.data()?.hourlyRate ?? byId.data()?.hourly_rate ?? 120)
          currency = String(byId.data()?.currency ?? 'GBP').toUpperCase()
        }
      }
    } catch (err) {
      console.error('[bookings] chef lookup failed:', err)
    }

    if (!chefId) {
      throw new ValidationError('A chef must be selected before booking.', {
        chefId: ['Choose a chef to book.'],
      })
    }

    const duration = Math.max(1, Number(durationHours) || 3)
    const subtotalMinor = toMinor(hourlyRateMajor) * duration
    const feePercent = platformFeePercent()
    const platformFeeMinor = Math.round((subtotalMinor * feePercent) / 100)
    const totalMinor = subtotalMinor + platformFeeMinor

    const bookingRef = adminDb.collection(COLLECTIONS.BOOKINGS).doc()

    // ── PaymentIntent on the platform account ─────────────────────────
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalMinor,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          bookingId: bookingRef.id,
          clientId: user.uid,
          chefId,
          eventDate: String(eventDate ?? ''),
          eventTime: String(eventTime ?? ''),
        },
      },
      // Guards against a double-submitted form creating two charges.
      { idempotencyKey: `booking_${bookingRef.id}` },
    )

    await bookingRef.set({
      client_id: user.uid,
      user_id: user.uid,
      chef_id: chefId,
      event_date: String(eventDate ?? new Date().toISOString().slice(0, 10)),
      event_time: String(eventTime ?? '19:00'),
      duration_hours: duration,
      guest_count: Math.max(1, Number(guestCount) || 2),
      event_type: eventType ?? 'Private Dinner',
      special_requests: specialRequests ?? null,
      currency,
      subtotal: toMajor(subtotalMinor),
      total_amount: toMajor(totalMinor),
      total_price: toMajor(totalMinor),
      platform_fee: toMajor(platformFeeMinor),
      chef_payout: toMajor(subtotalMinor),
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending_payment',
      payment_status: 'pending',
      payout_status: 'unpaid',
      payout_attempt: 0,
      address_line1: (address as Record<string, unknown>)?.line1 ?? null,
      address_city: (address as Record<string, unknown>)?.city ?? null,
      address_state: (address as Record<string, unknown>)?.state ?? null,
      address_zip: (address as Record<string, unknown>)?.zip ?? null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: bookingRef.id,
      amountDue: toMajor(totalMinor),
      currency,
      breakdown: {
        subtotal: toMajor(subtotalMinor),
        platformFee: toMajor(platformFeeMinor),
        total: toMajor(totalMinor),
        feePercent,
      },
    })
  } catch (error) {
    return toErrorResponse(error, 'bookings POST')
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const asChef = request.nextUrl.searchParams.get('as') === 'chef'
    const field = asChef ? 'chef_id' : 'client_id'

    const snap = await adminDb
      .collection(COLLECTIONS.BOOKINGS)
      .where(field, '==', user.uid)
      .limit(100)
      .get()

    const bookings = snap.docs
      .map((doc) => {
        const b = doc.data()
        return {
          id: doc.id,
          chefId: (b.chef_id as string) ?? null,
          chefName: (b.chef_name as string) ?? null,
          eventDate: (b.event_date as string) ?? null,
          eventTime: (b.event_time as string) ?? null,
          durationHours: Number(b.duration_hours) || 0,
          guestCount: Number(b.guest_count) || 0,
          eventType: (b.event_type as string) ?? null,
          status: (b.status as string) ?? 'pending',
          paymentStatus: (b.payment_status as string) ?? 'pending',
          payoutStatus: (b.payout_status as string) ?? 'unpaid',
          totalAmount: Number(b.total_amount ?? b.total_price) || 0,
          currency: (b.currency as string) ?? 'GBP',
          createdAt: toIso(b.created_at),
        }
      })
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    return toErrorResponse(error, 'bookings GET')
  }
}
