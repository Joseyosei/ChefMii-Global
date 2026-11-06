/**
 * Verification lifecycle: application -> three stages -> published chef.
 *
 * SERVER ONLY (imports firebase-admin).
 *
 * The rule that matters: a chef profile is only ever published when all three
 * stages are approved. Publishing is centralised in `syncVerificationState` so
 * no future call site can accidentally list an unverified chef in the public
 * marketplace.
 */

import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { toIso, toIsoRequired, toStringArray } from '@/lib/firebase/serialize'
import { slugify } from '@/lib/utils'
import type {
  ChefApplication,
  ChefVerification,
  VerificationStage,
  VerificationStageId,
  VerificationStatus,
} from '@/types/onboarding'
import { VERIFICATION_STAGE_ORDER } from '@/types/onboarding'

/** Build the initial, empty verification record for a new applicant. */
export function emptyVerification(chefId: string): ChefVerification {
  const now = new Date().toISOString()
  const stage = (id: VerificationStageId): VerificationStage => ({
    id,
    status: 'not_started',
    documentIds: [],
    adminNotes: null,
    reviewedBy: null,
    reviewedAt: null,
    submittedAt: null,
  })

  return {
    id: chefId,
    chefId,
    stages: {
      identity: stage('identity'),
      credentials: stage('credentials'),
      quality: stage('quality'),
    },
    completedStages: 0,
    isFullyVerified: false,
    createdAt: now,
    updatedAt: now,
  }
}

/** Read a verification record, creating it if the applicant has none yet. */
export async function getOrCreateVerification(chefId: string): Promise<ChefVerification> {
  const ref = adminDb.collection(COLLECTIONS.CHEF_VERIFICATION).doc(chefId)
  const snap = await ref.get()

  if (!snap.exists) {
    const fresh = emptyVerification(chefId)
    await ref.set(fresh)
    return fresh
  }

  return parseVerification(chefId, snap.data() ?? {})
}

export function parseVerification(chefId: string, data: Record<string, unknown>): ChefVerification {
  const rawStages = (data.stages ?? {}) as Record<string, Record<string, unknown>>

  const readStage = (id: VerificationStageId): VerificationStage => {
    const raw = rawStages[id] ?? {}
    return {
      id,
      status: (raw.status as VerificationStatus) ?? 'not_started',
      documentIds: toStringArray(raw.documentIds),
      adminNotes: (raw.adminNotes as string) ?? null,
      reviewedBy: (raw.reviewedBy as string) ?? null,
      reviewedAt: toIso(raw.reviewedAt),
      submittedAt: toIso(raw.submittedAt),
    }
  }

  const stages = {
    identity: readStage('identity'),
    credentials: readStage('credentials'),
    quality: readStage('quality'),
  }

  return {
    id: chefId,
    chefId: (data.chefId as string) ?? chefId,
    stages,
    completedStages: countCompleted(stages),
    isFullyVerified: VERIFICATION_STAGE_ORDER.every((s) => stages[s].status === 'approved'),
    createdAt: toIsoRequired(data.createdAt),
    updatedAt: toIsoRequired(data.updatedAt),
  }
}

/**
 * Count consecutively approved stages from the start.
 * Stops at the first gap, so an out-of-order approval cannot inflate progress.
 */
function countCompleted(stages: Record<VerificationStageId, VerificationStage>): 0 | 1 | 2 | 3 {
  let n = 0
  for (const id of VERIFICATION_STAGE_ORDER) {
    if (stages[id].status !== 'approved') break
    n++
  }
  return n as 0 | 1 | 2 | 3
}

/** Mark a stage as submitted once the applicant has uploaded its documents. */
export async function markStageSubmitted(
  chefId: string,
  stage: VerificationStageId,
  documentId: string,
): Promise<void> {
  const ref = adminDb.collection(COLLECTIONS.CHEF_VERIFICATION).doc(chefId)

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists
      ? parseVerification(chefId, snap.data() ?? {})
      : emptyVerification(chefId)

    const existing = current.stages[stage]

    // An already-approved stage is never reopened by a new upload; the admin
    // would have to reject it first.
    if (existing.status === 'approved') return

    tx.set(
      ref,
      {
        chefId,
        stages: {
          ...current.stages,
          [stage]: {
            ...existing,
            status: 'pending',
            documentIds: Array.from(new Set([...existing.documentIds, documentId])),
            submittedAt: existing.submittedAt ?? new Date().toISOString(),
          },
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  })
}

export interface StageDecision {
  chefId: string
  stage: VerificationStageId
  decision: 'approved' | 'rejected'
  adminId: string
  notes?: string | null
}

/**
 * Record an admin decision on one stage, then reconcile the chef's public
 * profile with the new state.
 *
 * Returns the updated verification plus whether the chef just went live.
 */
export async function decideStage(
  input: StageDecision,
): Promise<{ verification: ChefVerification; published: boolean }> {
  const { chefId, stage, decision, adminId, notes } = input
  const ref = adminDb.collection(COLLECTIONS.CHEF_VERIFICATION).doc(chefId)

  if (decision === 'rejected' && !notes?.trim()) {
    throw new Error('A rejection must include a reason so the chef knows what to fix.')
  }

  const verification = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists
      ? parseVerification(chefId, snap.data() ?? {})
      : emptyVerification(chefId)

    const updatedStages: Record<VerificationStageId, VerificationStage> = {
      ...current.stages,
      [stage]: {
        ...current.stages[stage],
        status: decision,
        adminNotes: notes?.trim() || null,
        reviewedBy: adminId,
        reviewedAt: new Date().toISOString(),
      },
    }

    tx.set(
      ref,
      {
        chefId,
        stages: updatedStages,
        completedStages: countCompleted(updatedStages),
        isFullyVerified: VERIFICATION_STAGE_ORDER.every(
          (s) => updatedStages[s].status === 'approved',
        ),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return {
      ...current,
      stages: updatedStages,
      completedStages: countCompleted(updatedStages),
      isFullyVerified: VERIFICATION_STAGE_ORDER.every(
        (s) => updatedStages[s].status === 'approved',
      ),
    }
  })

  await writeAudit({
    actorId: adminId,
    action: `verification.${decision}`,
    targetType: 'chef_verification',
    targetId: chefId,
    detail: { stage, notes: notes ?? null },
  })

  const published = await syncVerificationState(chefId, verification)
  return { verification, published }
}

/**
 * Reconcile the public chef profile with verification state.
 *
 * This is the ONLY place `isPublished` is set to true. Returns true when the
 * chef became publicly listed on this call.
 */
export async function syncVerificationState(
  chefId: string,
  verification: ChefVerification,
): Promise<boolean> {
  const chefRef = adminDb.collection(COLLECTIONS.CHEFS).doc(chefId)
  const appRef = adminDb.collection(COLLECTIONS.CHEF_APPLICATIONS).doc(chefId)

  const [chefSnap, appSnap] = await Promise.all([chefRef.get(), appRef.get()])
  const wasPublished = Boolean(chefSnap.data()?.isPublished)

  // Any rejected stage fails the whole application.
  const rejected = VERIFICATION_STAGE_ORDER.find(
    (s) => verification.stages[s].status === 'rejected',
  )

  if (rejected) {
    await Promise.all([
      chefRef.set(
        { isVerified: false, isPublished: false, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      ),
      appSnap.exists
        ? appRef.set(
            {
              status: 'changes_requested',
              rejectionReason: verification.stages[rejected].adminNotes ?? null,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          )
        : Promise.resolve(),
    ])
    return false
  }

  if (!verification.isFullyVerified) {
    await chefRef.set(
      { isVerified: false, isPublished: false, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    )
    return false
  }

  // Fully verified: build or refresh the public directory record.
  const application = appSnap.exists ? parseApplication(chefId, appSnap.data() ?? {}) : null

  // Resolve the slug BEFORE opening the transaction. buildSlug performs its own
  // reads, and reads issued inside a transaction callback but not through `tx`
  // are not part of the transaction's consistency guarantee.
  const existingSlug = (chefSnap.data()?.slug as string) || ''
  const slug = existingSlug || (await buildSlug(application?.fullName, chefId))

  await adminDb.runTransaction(async (tx) => {
    tx.set(
      chefRef,
      {
        userId: chefId,
        slug,
        name: application?.fullName ?? chefSnap.data()?.name ?? 'ChefMii Chef',
        bio: application?.bio ?? chefSnap.data()?.bio ?? '',
        chefType: application?.chefType ?? 'independent',
        cuisines: application?.cuisines ?? [],
        specialties: application?.specialties ?? [],
        yearsExperience: application?.yearsExperience ?? 0,
        hourlyRate: application?.hourlyRate ?? 0,
        currency: application?.currency ?? 'GBP',
        minGuests: application?.minGuests ?? 2,
        maxGuests: application?.maxGuests ?? 12,
        locationCity: application?.locationCity ?? '',
        locationCountry: application?.locationCountry ?? '',
        isVerified: true,
        isPublished: true,
        isAvailable: chefSnap.data()?.isAvailable ?? true,
        badgeTier: chefSnap.data()?.badgeTier ?? 'verified',
        avgRating: chefSnap.data()?.avgRating ?? null,
        totalReviews: chefSnap.data()?.totalReviews ?? 0,
        verifiedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        ...(chefSnap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    )

    // Promote the user to the chef role so the chef dashboard unlocks.
    tx.set(
      adminDb.collection(COLLECTIONS.USERS).doc(chefId),
      { role: 'chef', updated_at: FieldValue.serverTimestamp() },
      { merge: true },
    )

    if (appSnap.exists) {
      tx.set(
        appRef,
        {
          status: 'approved',
          decidedAt: FieldValue.serverTimestamp(),
          rejectionReason: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    }
  })

  return !wasPublished
}

/** Build a unique slug, appending a short suffix on collision. */
async function buildSlug(name: string | undefined, chefId: string): Promise<string> {
  const base = slugify(name || '') || `chef-${chefId.slice(0, 6)}`

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${chefId.slice(0, 4 + attempt)}`
    const clash = await adminDb
      .collection(COLLECTIONS.CHEFS)
      .where('slug', '==', candidate)
      .limit(1)
      .get()

    if (clash.empty || clash.docs[0].id === chefId) return candidate
  }

  return `${base}-${chefId.slice(0, 8)}`
}

export function parseApplication(id: string, data: Record<string, unknown>): ChefApplication {
  const str = (k: string, fallback = '') => (data[k] as string) ?? fallback
  const num = (k: string, fallback = 0) => {
    const v = data[k]
    return typeof v === 'number' && Number.isFinite(v) ? v : fallback
  }

  return {
    id,
    userId: str('userId', id),
    status: (data.status as ChefApplication['status']) ?? 'draft',
    fullName: str('fullName'),
    email: str('email'),
    phone: str('phone'),
    chefType: (data.chefType as ChefApplication['chefType']) ?? 'independent',
    cuisines: toStringArray(data.cuisines),
    specialties: toStringArray(data.specialties),
    yearsExperience: num('yearsExperience'),
    bio: str('bio'),
    hourlyRate: num('hourlyRate'),
    currency: (data.currency as ChefApplication['currency']) ?? 'GBP',
    minGuests: num('minGuests', 2),
    maxGuests: num('maxGuests', 12),
    locationCity: str('locationCity'),
    locationCountry: str('locationCountry'),
    travelRadiusMiles: num('travelRadiusMiles', 15),
    portfolioUrls: toStringArray(data.portfolioUrls),
    instagramHandle: (data.instagramHandle as string) ?? null,
    submittedAt: toIso(data.submittedAt),
    decidedAt: toIso(data.decidedAt),
    decidedBy: (data.decidedBy as string) ?? null,
    rejectionReason: (data.rejectionReason as string) ?? null,
    createdAt: toIsoRequired(data.createdAt),
    updatedAt: toIsoRequired(data.updatedAt),
  }
}

export interface AuditEntry {
  actorId: string
  action: string
  targetType: string
  targetId: string
  detail?: Record<string, unknown>
}

/** Append-only audit trail. Never throws: an audit failure must not block the action. */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await adminDb.collection(COLLECTIONS.ADMIN_AUDIT).add({
      ...entry,
      detail: entry.detail ?? {},
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error('[verification-service] audit write failed:', err)
  }
}
