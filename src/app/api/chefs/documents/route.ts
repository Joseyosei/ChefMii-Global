/**
 * Verification document registration.
 *
 *   POST /api/chefs/documents  record a file already uploaded to Cloud Storage
 *   GET  /api/chefs/documents  list the caller's own documents
 *
 * The browser uploads the file straight to Cloud Storage (so a 200 MB video
 * never passes through a serverless function and hits its body limit), then
 * calls this endpoint to register the metadata and move the stage forward.
 *
 * Because the client chooses the storage path, this handler re-derives the
 * expected prefix from the authenticated uid and rejects anything pointing
 * outside the caller's own folder. `storage.rules` enforces the same boundary
 * at the storage layer, so neither check alone is load-bearing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAuth, toErrorResponse, ValidationError } from '@/lib/auth/server-auth'
import {
  documentRegistrationSchema,
  flattenZodError,
  isDocumentValidForStage,
  validateUploadConstraints,
} from '@/lib/chefs/validation'
import { markStageSubmitted } from '@/lib/chefs/verification-service'
import { toIso } from '@/lib/firebase/serialize'
import type { ChefDocument } from '@/types/onboarding'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json().catch(() => {
      throw new ValidationError('Request body must be valid JSON.')
    })

    const parsed = documentRegistrationSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError('That document could not be registered.', flattenZodError(parsed.error))
    }

    const { stage, type, storagePath, filename, contentType, sizeBytes } = parsed.data

    // The path must sit inside this user's own document folder.
    const expectedPrefix = `chef-documents/${user.uid}/`
    if (!storagePath.startsWith(expectedPrefix)) {
      throw new ValidationError('That storage path does not belong to your account.', {
        storagePath: ['Upload the file to your own folder and try again.'],
      })
    }

    if (!isDocumentValidForStage(stage, type)) {
      throw new ValidationError(`A ${type.replace(/_/g, ' ')} is not accepted at the ${stage} stage.`, {
        type: ['Choose a document type that this stage asks for.'],
      })
    }

    const constraints = validateUploadConstraints(contentType, sizeBytes)
    if (!constraints.ok) {
      throw new ValidationError(constraints.reason, { file: [constraints.reason] })
    }

    const docRef = adminDb.collection(COLLECTIONS.CHEF_DOCUMENTS).doc()

    await docRef.set({
      chefId: user.uid,
      stage,
      type,
      storagePath,
      filename,
      contentType,
      sizeBytes,
      uploadedAt: FieldValue.serverTimestamp(),
    })

    // Moving the stage to 'pending' is what puts the chef into the admin queue.
    await markStageSubmitted(user.uid, stage, docRef.id)

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      stage,
      message: 'Document received and queued for review.',
    })
  } catch (error) {
    return toErrorResponse(error, 'chefs/documents POST')
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const snap = await adminDb
      .collection(COLLECTIONS.CHEF_DOCUMENTS)
      .where('chefId', '==', user.uid)
      .get()

    const documents: ChefDocument[] = snap.docs
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
      // Sorted here rather than in the query so this endpoint keeps working
      // before the composite index is deployed.
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))

    return NextResponse.json({ success: true, documents })
  } catch (error) {
    return toErrorResponse(error, 'chefs/documents GET')
  }
}
