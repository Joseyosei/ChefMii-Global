/**
 * Admin decision on one verification stage.
 *
 *   POST /api/admin/chef-applications/{chefId}
 *   body: { stage, decision: 'approved' | 'rejected', notes? }
 *
 * Approving the final stage publishes the chef's public profile and promotes
 * their user role to `chef`. That transition lives in `syncVerificationState`
 * so it cannot be triggered from anywhere else by accident.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAdmin, toErrorResponse, ValidationError } from '@/lib/auth/server-auth'
import { flattenZodError } from '@/lib/chefs/validation'
import { decideStage, parseApplication } from '@/lib/chefs/verification-service'
import {
  sendChefApproved,
  sendStageApproved,
  sendStageRejected,
} from '@/lib/email/notifications'
import { VERIFICATION_STAGE_META, VERIFICATION_STAGE_ORDER } from '@/types/onboarding'

export const dynamic = 'force-dynamic'

const decisionSchema = z
  .object({
    stage: z.enum(['identity', 'credentials', 'quality']),
    decision: z.enum(['approved', 'rejected']),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.decision === 'approved' || Boolean(d.notes?.trim()), {
    message: 'A rejection needs a reason so the chef knows what to fix.',
    path: ['notes'],
  })

export async function POST(
  request: NextRequest,
  { params }: { params: { chefId: string } },
) {
  try {
    const admin = await requireAdmin(request)
    const chefId = params.chefId

    if (!chefId) {
      throw new ValidationError('A chef id is required.')
    }

    const body = await request.json().catch(() => {
      throw new ValidationError('Request body must be valid JSON.')
    })

    const parsed = decisionSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError('That decision could not be recorded.', flattenZodError(parsed.error))
    }

    const { stage, decision, notes } = parsed.data

    const appSnap = await adminDb.collection(COLLECTIONS.CHEF_APPLICATIONS).doc(chefId).get()
    if (!appSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'No application found for that chef.' },
        { status: 404 },
      )
    }

    const application = parseApplication(chefId, appSnap.data() ?? {})

    const { verification, published } = await decideStage({
      chefId,
      stage,
      decision,
      adminId: admin.uid,
      notes: notes ?? null,
    })

    // Notify the chef. Email never blocks the decision from being recorded.
    const stageLabel = VERIFICATION_STAGE_META[stage].label
    void (async () => {
      try {
        if (decision === 'rejected') {
          await sendStageRejected({
            to: application.email,
            name: application.fullName,
            stageLabel,
            reason: notes?.trim() ?? 'Please re-upload the requested document.',
          })
          return
        }

        if (verification.isFullyVerified) {
          const slug =
            ((await adminDb.collection(COLLECTIONS.CHEFS).doc(chefId).get()).data()
              ?.slug as string) || chefId
          await sendChefApproved({
            to: application.email,
            name: application.fullName,
            profileUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.chefmii.com'}/chefs/${slug}`,
          })
          return
        }

        const remaining = VERIFICATION_STAGE_ORDER.filter(
          (s) => verification.stages[s].status !== 'approved',
        ).length

        await sendStageApproved({
          to: application.email,
          name: application.fullName,
          stageLabel,
          remaining,
        })
      } catch (err) {
        console.error('[admin/chef-applications] notification failed:', err)
      }
    })()

    return NextResponse.json({
      success: true,
      verification,
      published,
      message: published
        ? 'Approved. The chef is now live in the directory.'
        : decision === 'approved'
          ? `${stageLabel} approved.`
          : `${stageLabel} sent back for changes.`,
    })
  } catch (error) {
    return toErrorResponse(error, 'admin/chef-applications POST')
  }
}
