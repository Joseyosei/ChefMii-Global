/**
 * Chef application endpoint.
 *
 *   POST /api/chefs/apply   submit or update an application
 *   GET  /api/chefs/apply   read the signed-in user's own application + progress
 *
 * Identity always comes from a verified Firebase ID token. There is no
 * `body.userId` fallback: the document id is the caller's uid, so an applicant
 * can only ever write their own application.
 */

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAuth, toErrorResponse, ValidationError } from '@/lib/auth/server-auth'
import { chefApplicationSchema, flattenZodError } from '@/lib/chefs/validation'
import {
  getOrCreateVerification,
  parseApplication,
} from '@/lib/chefs/verification-service'
import { sendChefApplicationReceived } from '@/lib/email/notifications'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json().catch(() => {
      throw new ValidationError('Request body must be valid JSON.')
    })

    const parsed = chefApplicationSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(
        'Some details need fixing before we can submit your application.',
        flattenZodError(parsed.error),
      )
    }

    const data = parsed.data
    const ref = adminDb.collection(COLLECTIONS.CHEF_APPLICATIONS).doc(user.uid)
    const existing = await ref.get()

    // An approved chef must not silently rewrite the application their
    // verification was based on.
    if (existing.exists) {
      const current = parseApplication(user.uid, existing.data() ?? {})
      if (current.status === 'approved') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Your application is already approved. Edit your public profile from the chef dashboard instead.',
          },
          { status: 409 },
        )
      }
      if (current.status === 'in_review') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Your application is currently being reviewed. We will email you as soon as there is an update.',
          },
          { status: 409 },
        )
      }
    }

    const isFirstSubmission = !existing.exists

    await ref.set(
      {
        ...data,
        userId: user.uid,
        status: 'submitted',
        submittedAt: existing.data()?.submittedAt ?? FieldValue.serverTimestamp(),
        rejectionReason: null,
        updatedAt: FieldValue.serverTimestamp(),
        ...(isFirstSubmission ? { createdAt: FieldValue.serverTimestamp() } : {}),
      },
      { merge: true },
    )

    // Create the verification shell so the applicant immediately sees the
    // three stages and what each one needs.
    const verification = await getOrCreateVerification(user.uid)

    // Email is best-effort: a transport failure must not lose the application.
    void sendChefApplicationReceived({
      to: data.email,
      name: data.fullName,
    }).catch((err) => console.error('[chefs/apply] confirmation email failed:', err))

    return NextResponse.json({
      success: true,
      applicationId: user.uid,
      status: 'submitted',
      verification,
      message: 'Application received. Upload your documents to start verification.',
    })
  } catch (error) {
    return toErrorResponse(error, 'chefs/apply POST')
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const snap = await adminDb.collection(COLLECTIONS.CHEF_APPLICATIONS).doc(user.uid).get()

    if (!snap.exists) {
      return NextResponse.json({ success: true, application: null, verification: null })
    }

    const application = parseApplication(user.uid, snap.data() ?? {})
    const verification = await getOrCreateVerification(user.uid)

    return NextResponse.json({ success: true, application, verification })
  } catch (error) {
    return toErrorResponse(error, 'chefs/apply GET')
  }
}
