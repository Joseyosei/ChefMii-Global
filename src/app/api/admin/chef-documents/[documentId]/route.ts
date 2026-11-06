/**
 * Short-lived signed URL for a private verification document.
 *
 *   GET /api/admin/chef-documents/{documentId}
 *
 * Identity documents are never world-readable. An admin reviewing a stage gets
 * a URL valid for 10 minutes, long enough to look at the file and short enough
 * that a leaked link is close to worthless. Every issue is written to the audit
 * trail, because reading someone's passport scan should leave a record.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminStorage } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { requireAdmin, toErrorResponse } from '@/lib/auth/server-auth'
import { writeAudit } from '@/lib/chefs/verification-service'

export const dynamic = 'force-dynamic'

const URL_TTL_MS = 10 * 60 * 1000

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    const admin = await requireAdmin(request)

    const snap = await adminDb
      .collection(COLLECTIONS.CHEF_DOCUMENTS)
      .doc(params.documentId)
      .get()

    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 })
    }

    const data = snap.data() ?? {}
    const storagePath = data.storagePath as string | undefined

    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: 'That document record has no file attached.' },
        { status: 409 },
      )
    }

    const file = adminStorage.bucket().file(storagePath)

    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'The file is missing from storage. Ask the chef to re-upload.' },
        { status: 404 },
      )
    }

    const expiresAt = Date.now() + URL_TTL_MS
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
    })

    await writeAudit({
      actorId: admin.uid,
      action: 'document.viewed',
      targetType: 'chef_document',
      targetId: params.documentId,
      detail: { chefId: data.chefId ?? null, type: data.type ?? null },
    })

    return NextResponse.json({
      success: true,
      url,
      filename: data.filename ?? 'document',
      contentType: data.contentType ?? 'application/octet-stream',
      expiresAt: new Date(expiresAt).toISOString(),
    })
  } catch (error) {
    // getSignedUrl needs a service account private key. Without
    // FIREBASE_SERVICE_ACCOUNT_KEY, Admin SDK default credentials cannot sign.
    if (error instanceof Error && /sign|credential|private key/i.test(error.message)) {
      console.error('[admin/chef-documents] signing failed:', error)
      return NextResponse.json(
        {
          success: false,
          error:
            'Document signing is not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY so the server can sign storage URLs.',
        },
        { status: 503 },
      )
    }
    return toErrorResponse(error, 'admin/chef-documents GET')
  }
}
