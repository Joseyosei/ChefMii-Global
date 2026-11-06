/**
 * Stripe Connect onboarding for chefs.
 *
 *   POST /api/stripe/connect   create or reuse an Express account, return an
 *                              onboarding link for the signed-in chef
 *   GET  /api/stripe/connect   payout readiness for the signed-in chef
 *
 * SECURITY FIX: the previous version fell back to `body.chefId` when token
 * verification failed, so an unauthenticated caller could mint an onboarding
 * link for someone else's connected account, or attach a new account to
 * another chef's record. The account is now always keyed to the verified uid,
 * and the GET no longer takes an arbitrary `accountId` from the query string
 * (which let anyone probe any connected account on the platform).
 */

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAuth, toErrorResponse } from '@/lib/auth/server-auth'

export const dynamic = 'force-dynamic'

/** Read the connected account id recorded against this user. */
async function getAccountId(uid: string): Promise<string | null> {
  const [chefSnap, userSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.CHEFS).doc(uid).get(),
    adminDb.collection(COLLECTIONS.USERS).doc(uid).get(),
  ])

  return (
    (chefSnap.data()?.stripeAccountId as string) ??
    (chefSnap.data()?.stripe_account_id as string) ??
    (userSnap.data()?.stripe_account_id as string) ??
    null
  )
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const origin =
      request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    let accountId = await getAccountId(user.uid)

    if (!accountId) {
      const account = await stripe.accounts.create(
        {
          type: 'express',
          country: 'GB',
          email: user.email ?? undefined,
          business_type: 'individual',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          settings: {
            payouts: {
              // Manual schedule: ChefMii controls when money leaves the chef's
              // Stripe balance, which keeps the escrow promise intact.
              schedule: { interval: 'manual' },
            },
          },
          metadata: { chefId: user.uid },
        },
        // One account per chef even if they double-click the button.
        { idempotencyKey: `connect_account_${user.uid}` },
      )

      accountId = account.id

      // Written with the Admin SDK, which bypasses security rules. Clients
      // cannot write these fields themselves (see firestore.rules).
      const payload = {
        stripeAccountId: accountId,
        stripe_account_id: accountId, // legacy key, kept for existing readers
        stripeStatus: 'pending',
        stripe_status: 'pending',
        chargesEnabled: false,
        payoutsEnabled: false,
        updatedAt: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      }

      await Promise.all([
        adminDb.collection(COLLECTIONS.CHEFS).doc(user.uid).set(payload, { merge: true }),
        adminDb.collection(COLLECTIONS.USERS).doc(user.uid).set(
          {
            stripe_account_id: accountId,
            stripe_status: 'pending',
            updated_at: FieldValue.serverTimestamp(),
          },
          { merge: true },
        ),
      ])
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/chef-dashboard?stripe_refresh=true`,
      return_url: `${origin}/chef-dashboard?stripe_success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ success: true, accountId, url: accountLink.url })
  } catch (error) {
    return toErrorResponse(error, 'stripe/connect POST')
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const accountId = await getAccountId(user.uid)

    if (!accountId) {
      return NextResponse.json({
        success: true,
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        message: 'Connect your bank through Stripe to receive payouts.',
      })
    }

    const account = await stripe.accounts.retrieve(accountId)

    const status = account.details_submitted
      ? account.payouts_enabled
        ? 'active'
        : 'restricted'
      : 'pending'

    // Keep Firestore in step so the dashboard and the payout sweep agree.
    await adminDb.collection(COLLECTIONS.CHEFS).doc(user.uid).set(
      {
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
        stripeStatus: status,
        stripe_status: status,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return NextResponse.json({
      success: true,
      connected: true,
      accountId,
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      detailsSubmitted: Boolean(account.details_submitted),
      status,
      country: account.country,
      // Surfaces exactly what Stripe still wants, so a chef is not stuck
      // guessing why payouts are disabled.
      requirements: account.requirements?.currently_due ?? [],
    })
  } catch (error) {
    return toErrorResponse(error, 'stripe/connect GET')
  }
}
