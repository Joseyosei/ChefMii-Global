'use client'

/**
 * CheftTV video upload.
 *
 * WHY THIS EXISTS
 * The previous upload wrote `URL.createObjectURL(file)` into Firestore as the
 * video_url. That is a `blob:` URL scoped to the uploader's own browser tab: it
 * is a dead link for every other viewer and stops working for the uploader
 * themselves on refresh. No file ever reached Cloud Storage, so CheftTV had no
 * real video in it.
 *
 * This uploads the actual file to `chef-media/{uid}/{filename}` (public-read per
 * storage.rules) and returns a real, durable download URL. It also captures a
 * poster frame in the browser so a reel is not a black rectangle before play.
 *
 * The video goes straight from the browser to Storage; a 200 MB file never
 * passes through a serverless function.
 */

import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage'
import { storage, auth } from '@/lib/firebase/client'
import { STORAGE_PATHS } from '@/lib/firebase/collections'
import { DOCUMENT_LIMITS } from '@/types/onboarding'

export class MediaUploadError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'MediaUploadError'
  }
}

export interface MediaUploadResult {
  videoUrl: string
  thumbnailUrl: string | null
  storagePath: string
  durationSeconds: number | null
}

const ALLOWED_VIDEO_TYPES = DOCUMENT_LIMITS.allowedVideoTypes
const MAX_VIDEO_BYTES = DOCUMENT_LIMITS.maxVideoBytes // 200 MB

function safeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\- ]/g, '')
    .replace(/\s+/g, '-')
    .slice(-100)
  return cleaned || 'video.mp4'
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Capture a poster frame and the duration from a video File, in the browser.
 *
 * Best-effort: if the browser cannot decode the file for a frame grab, we return
 * nulls and the reel just shows the first painted frame instead of a poster.
 * Never throws into the upload path.
 */
async function capturePoster(
  file: File,
): Promise<{ blob: Blob | null; durationSeconds: number | null }> {
  return new Promise((resolve) => {
    let settled = false
    const done = (blob: Blob | null, duration: number | null) => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(objectUrl)
      resolve({ blob, durationSeconds: duration })
    }

    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.src = objectUrl

    // Guard: some codecs never fire seeked in a headless-ish context.
    const timeout = setTimeout(() => done(null, null), 8000)

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : null
      // Seek a little in so we do not grab a black lead-in frame.
      const target = duration ? Math.min(1, duration / 2) : 0.1
      video.currentTime = target
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 720
        canvas.height = video.videoHeight || 1280
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          clearTimeout(timeout)
          done(null, Number.isFinite(video.duration) ? video.duration : null)
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout)
            done(blob, Number.isFinite(video.duration) ? video.duration : null)
          },
          'image/jpeg',
          0.8,
        )
      } catch {
        clearTimeout(timeout)
        done(null, null)
      }
    }

    video.onerror = () => {
      clearTimeout(timeout)
      done(null, null)
    }
  })
}

export interface UploadMediaArgs {
  file: File
  onProgress?: (percent: number) => void
}

/** Upload a CheftTV video and its poster. Returns durable public URLs. */
export async function uploadChefMediaVideo(args: UploadMediaArgs): Promise<MediaUploadResult> {
  const { file, onProgress } = args

  const user = auth.currentUser
  if (!user) {
    throw new MediaUploadError('You need to be signed in to upload a video.')
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type as never)) {
    throw new MediaUploadError('Upload an MP4, MOV or WebM video.')
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new MediaUploadError('Videos must be under 200 MB.')
  }
  if (file.size === 0) {
    throw new MediaUploadError('That file is empty.')
  }

  // Poster first (cheap, local). A failure here is non-fatal.
  const { blob: posterBlob, durationSeconds } = await capturePoster(file)

  const base = newId()
  const videoPath = STORAGE_PATHS.chefMedia(user.uid, `${base}-${safeFilename(file.name)}`)

  // ── Upload the video with progress ──────────────────────────────────
  const videoUrl = await new Promise<string>((resolve, reject) => {
    let task
    try {
      task = uploadBytesResumable(ref(storage, videoPath), file, { contentType: file.type })
    } catch (err) {
      reject(new MediaUploadError('Could not start the upload.', err))
      return
    }

    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0) {
          // Reserve the last 5% for the poster + metadata write.
          onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 95))
        }
      },
      (error) => {
        const message =
          (error as { code?: string }).code === 'storage/unauthorized'
            ? 'That video was rejected. Check it is under 200 MB and an MP4, MOV or WebM.'
            : 'The upload failed. Check your connection and try again.'
        reject(new MediaUploadError(message, error))
      },
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref))
        } catch (err) {
          reject(new MediaUploadError('Upload finished but the video URL could not be read.', err))
        }
      },
    )
  })

  // ── Upload the poster (best-effort) ─────────────────────────────────
  let thumbnailUrl: string | null = null
  if (posterBlob) {
    try {
      const posterPath = STORAGE_PATHS.chefMedia(user.uid, `${base}-poster.jpg`)
      const posterRef = ref(storage, posterPath)
      await uploadBytes(posterRef, posterBlob, { contentType: 'image/jpeg' })
      thumbnailUrl = await getDownloadURL(posterRef)
    } catch (err) {
      // A missing poster is cosmetic; never fail the upload for it.
      console.warn('[media-upload] poster upload failed:', err)
    }
  }

  onProgress?.(100)
  return { videoUrl, thumbnailUrl, storagePath: videoPath, durationSeconds }
}
