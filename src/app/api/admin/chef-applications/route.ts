/**
 * Admin review queue.
 *
 *   GET /api/admin/chef-applications?status=submitted
 *
 * Admin only. Returns each application alongside its verification state and
 * document metadata, so the console can render a full review card without a
 * request per applicant.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAdmin, toErrorResponse } from '@/lib/auth/server-auth'
import { parseApplication, parseVerification } from '@/lib/chefs/verification-service'
import { toIso } from '@/lib/firebase/serialize'
import type { ApplicationStatus, ChefDocument, ChefVerification } from '@/types/onboarding'

export const dynamic = 'force-dynamic'

const REVIEWABLE: ApplicationStatus[] = ['submitted', 'in_review', 'changes_requested']

export interface ReviewQueueItem {
  application: ReturnType<typeof parseApplication>
  verification: ChefVerification
  documents: ChefDocument[]
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const statusParam = request.nextUrl.searchParams.get('status')
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 50, 200)

    // Fetched without an orderBy so the endpoint works before the composite
    // index is deployed; sorting happens below.
    const snap = await adminDb.collection(COLLECTIONS.CHEF_APPLICATIONS).limit(limit).get()

    const applications = snap.docs
      .map((d) => parseApplication(d.id, d.data()))
      .filter((app) =>
        statusParam && statusParam !== 'all'
          ? app.status === statusParam
          : REVIEWABLE.includes(app.status),
      )
      // Oldest submission first, so nobody sits at the bottom of the pile.
      .sort((a, b) => (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''))

    const items: ReviewQueueItem[] = await Promise.all(
      applications.map(async (application) => {
        const [verificationSnap, documentsSnap] = await Promise.all([
          adminDb.collection(COLLECTIONS.CHEF_VERIFICATION).doc(application.id).get(),
          adminDb
            .collection(COLLECTIONS.CHEF_DOCUMENTS)
            .where('chefId', '==', application.id)
            .get(),
        ])

        const verification = verificationSnap.exists
          ? parseVerification(application.id, verificationSnap.data() ?? {})
          : parseVerification(application.id, {})

        const documents: ChefDocument[] = documentsSnap.docs
          .map((d) => {
            const data = d.data()
            return {
              id: d.id,
              chefId: data.chefId as string,
              stage: data.stage as ChefDocument['stage'],
              type: data.type as ChefDocument['type'],
              storagePath: data.storagePath as string,
              filename: data.filename as string,
              contentType: data.contentType as string,
              sizeBytes: Number(data.sizeBytes) || 0,
              uploadedAt: toIso(data.uploadedAt) ?? new Date(0).toISOString(),
            }
          })
          .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))

        return { application, verification, documents }
      }),
    )

    return NextResponse.json({ success: true, items, total: items.length })
  } catch (error) {
    return toErrorResponse(error, 'admin/chef-applications GET')
  }
}
