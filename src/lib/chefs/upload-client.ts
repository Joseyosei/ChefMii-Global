'use client'

/**
 * Browser-side document upload.
 *
 * Files go straight from the browser to Cloud Storage rather than through an
 * API route. A 200 MB cooking video would exceed the request body limit of a
 * serverless function, and streaming it through one would burn execution time
 * for no benefit.
 *
 * Flow:
 *   1. upload to `chef-documents/{uid}/{documentId}/{filename}` (storage.rules
 *      checks ownership, size and content type)
 *   2. POST the metadata to /api/chefs/documents, which re-validates and moves
 *      the verification stage into the review queue
 */

import { ref, uploadBytesResumable, type UploadTask } from 'firebase/storage'
import { storage, auth } from '@/lib/firebase/client'
import { STORAGE_PATHS } from '@/lib/firebase/collections'
import { validateUploadConstraints } from '@/lib/chefs/validation'
import type { DocumentType, VerificationStageId } from '@/types/onboarding'

export interface UploadDocumentArgs {
  file: File
  stage: VerificationStageId
  type: DocumentType
  /** Called with 0-100 as the upload progresses. */
  onProgress?: (percent: number) => void
}

export interface UploadDocumentResult {
  documentId: string
  storagePath: string
}

export class UploadError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

/** Strip characters that break Storage paths or Content-Disposition headers. */
function safeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\- ]/g, '')
    .replace(/\s+/g, '-')
    .slice(-120)
  return cleaned || 'upload'
}

/** Client-side id for the document folder. Collision risk is negligible. */
function newDocumentId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export async function uploadVerificationDocument(
  args: UploadDocumentArgs,
): Promise<UploadDocumentResult> {
  const { file, stage, type, onProgress } = args

  const user = auth.currentUser
  if (!user) {
    throw new UploadError('You need to be signed in to upload documents.')
  }

  // Check locally first so an oversized file fails instantly instead of after
  // a long upload that Storage rules would reject at the end.
  const constraints = validateUploadConstraints(file.type, file.size)
  if (!constraints.ok) {
    throw new UploadError(constraints.reason)
  }

  const documentId = newDocumentId()
  const filename = safeFilename(file.name)
  const storagePath = STORAGE_PATHS.chefDocument(user.uid, documentId, filename)

  await new Promise<void>((resolve, reject) => {
    let task: UploadTask
    try {
      task = uploadBytesResumable(ref(storage, storagePath), file, {
        contentType: file.type,
      })
    } catch (err) {
      reject(new UploadError('Could not start the upload.', err))
      return
    }

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
        }
      },
      (error) => {
        // storage/unauthorized means the rules rejected it: wrong folder, wrong
        // size, or wrong content type.
        const message =
          error.code === 'storage/unauthorized'
            ? 'That file was rejected. Check it is under the size limit and in an accepted format.'
            : error.code === 'storage/canceled'
              ? 'Upload cancelled.'
              : 'The upload failed. Check your connection and try again.'
        reject(new UploadError(message, error))
      },
      () => resolve(),
    )
  })

  // Register the metadata. If this fails the file is already in Storage but
  // orphaned, so surface it clearly rather than pretending the step succeeded.
  const idToken = await user.getIdToken()
  const response = await fetch('/api/chefs/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      stage,
      type,
      storagePath,
      filename,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  })

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; documentId?: string; error?: string }
    | null

  if (!response.ok || !payload?.success || !payload.documentId) {
    throw new UploadError(
      payload?.error ?? 'Your file uploaded but we could not record it. Please try again.',
    )
  }

  onProgress?.(100)
  return { documentId: payload.documentId, storagePath }
}

// Re-exported so existing imports from this module keep working; the shared
// implementation lives in `src/lib/api-client.ts`.
export { authedFetch } from '@/lib/api-client'
