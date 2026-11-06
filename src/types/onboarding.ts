/**
 * Domain types for chef onboarding, verification and payouts.
 *
 * These describe Firestore documents, so every timestamp is stored as an ISO
 * 8601 string. Firestore `serverTimestamp()` values are converted on read by
 * `toIso()` in `src/lib/firebase/serialize.ts` — never leak a Firestore
 * Timestamp into a React Server Component payload, it is not serialisable.
 */

// ─── Verification ──────────────────────────────────────────────────────

/** The three verification stages, in order. */
export type VerificationStageId = 'identity' | 'credentials' | 'quality'

export type VerificationStatus =
  | 'not_started'
  | 'pending'      // documents uploaded, waiting on review
  | 'in_review'    // an admin has picked it up
  | 'approved'
  | 'rejected'

export interface VerificationStage {
  id: VerificationStageId
  status: VerificationStatus
  /** Document ids (in CHEF_DOCUMENTS) submitted for this stage. */
  documentIds: string[]
  /** Visible to the applicant when rejected. Written by an admin. */
  adminNotes: string | null
  /** Uid of the admin who last decided this stage. */
  reviewedBy: string | null
  reviewedAt: string | null
  submittedAt: string | null
}

export interface ChefVerification {
  /** === applicant uid */
  id: string
  chefId: string
  stages: Record<VerificationStageId, VerificationStage>
  /** Derived: the furthest stage fully approved. 0 means none. */
  completedStages: 0 | 1 | 2 | 3
  /** True only when all three stages are approved. Gates public listing. */
  isFullyVerified: boolean
  createdAt: string
  updatedAt: string
}

export const VERIFICATION_STAGE_ORDER: VerificationStageId[] = [
  'identity',
  'credentials',
  'quality',
]

export const VERIFICATION_STAGE_META: Record<
  VerificationStageId,
  { label: string; description: string; slaHours: number; requiredDocuments: DocumentType[] }
> = {
  identity: {
    label: 'Identity',
    description: 'Government photo ID and a matching selfie.',
    slaHours: 24,
    requiredDocuments: ['government_id', 'selfie'],
  },
  credentials: {
    label: 'Credentials',
    description: 'Food hygiene certificate and public liability insurance.',
    slaHours: 48,
    requiredDocuments: ['food_hygiene_certificate', 'public_liability_insurance'],
  },
  quality: {
    label: 'Quality',
    description: 'A short cooking video so our team can assess your craft.',
    slaHours: 72,
    requiredDocuments: ['cooking_video'],
  },
}

// ─── Documents ─────────────────────────────────────────────────────────

export type DocumentType =
  | 'government_id'
  | 'selfie'
  | 'food_hygiene_certificate'
  | 'public_liability_insurance'
  | 'allergen_certificate'
  | 'professional_qualification'
  | 'cooking_video'

export interface ChefDocument {
  id: string
  chefId: string
  stage: VerificationStageId
  type: DocumentType
  /** Cloud Storage object path, NOT a public URL. Signed on demand for admins. */
  storagePath: string
  filename: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

/** Upload limits enforced both client-side and in `storage.rules`. */
export const DOCUMENT_LIMITS = {
  maxImageBytes: 10 * 1024 * 1024, // 10 MB
  maxVideoBytes: 200 * 1024 * 1024, // 200 MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
} as const

// ─── Application ───────────────────────────────────────────────────────

export type ChefType = 'independent' | 'freelance' | 'professional' | 'home' | 'michelin'

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'

export interface ChefApplication {
  /** === applicant uid, so one person cannot open competing applications. */
  id: string
  userId: string
  status: ApplicationStatus
  // Identity
  fullName: string
  email: string
  phone: string
  // Craft
  chefType: ChefType
  cuisines: string[]
  specialties: string[]
  yearsExperience: number
  bio: string
  // Commercials
  hourlyRate: number
  currency: 'GBP' | 'USD' | 'EUR' | 'AED'
  minGuests: number
  maxGuests: number
  // Where they work
  locationCity: string
  locationCountry: string
  travelRadiusMiles: number
  // Social proof
  portfolioUrls: string[]
  instagramHandle: string | null
  // Lifecycle
  submittedAt: string | null
  decidedAt: string | null
  decidedBy: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

/** Fields the applicant supplies in the public form. */
export type ChefApplicationInput = Pick<
  ChefApplication,
  | 'fullName'
  | 'email'
  | 'phone'
  | 'chefType'
  | 'cuisines'
  | 'specialties'
  | 'yearsExperience'
  | 'bio'
  | 'hourlyRate'
  | 'currency'
  | 'minGuests'
  | 'maxGuests'
  | 'locationCity'
  | 'locationCountry'
  | 'travelRadiusMiles'
  | 'portfolioUrls'
  | 'instagramHandle'
>

// ─── Public chef profile (the directory record) ────────────────────────

export type ChefBadgeTier = 'verified' | 'pro' | 'elite'

export interface ChefDirectoryProfile {
  id: string
  userId: string
  slug: string
  name: string
  bio: string
  chefType: ChefType
  cuisines: string[]
  specialties: string[]
  yearsExperience: number
  hourlyRate: number
  currency: string
  minGuests: number
  maxGuests: number
  locationCity: string
  locationCountry: string
  photoUrl: string | null
  galleryUrls: string[]
  badgeTier: ChefBadgeTier
  avgRating: number | null
  totalReviews: number
  /** Only true once all three verification stages pass. */
  isVerified: boolean
  /** Chef's own availability switch. */
  isAvailable: boolean
  /** True when the profile may appear in public search. */
  isPublished: boolean
  // Payments
  stripeAccountId: string | null
  stripeStatus: 'none' | 'pending' | 'active' | 'restricted'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  createdAt: string
  updatedAt: string
}

// ─── Payouts ───────────────────────────────────────────────────────────

export type PayoutStatus = 'held' | 'releasing' | 'released' | 'failed' | 'reversed'

/**
 * One ledger row per payout attempt.
 *
 * Written server-side only. A `failed` row is never silently rewritten to
 * `released` — a retry appends a new attempt instead, so the money trail stays
 * auditable.
 */
export interface PayoutRecord {
  id: string
  bookingId: string
  chefId: string
  stripeAccountId: string | null
  /** Minor units (pence for GBP). Integers only — never store money as float. */
  grossAmountMinor: number
  platformFeeMinor: number
  netAmountMinor: number
  currency: string
  status: PayoutStatus
  stripeTransferId: string | null
  failureReason: string | null
  attempt: number
  createdAt: string
  releasedAt: string | null
}
