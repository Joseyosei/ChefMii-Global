/**
 * Canonical Firestore collection names.
 *
 * WHY THIS FILE EXISTS
 * Before this, collection names were typed as string literals at every call
 * site, and the codebase had drifted: `/api/bookings` read chefs from the
 * `chefs` collection, `src/types/database.ts` described `chef_profiles`, and
 * `firestore.rules` granted access to neither. Anything reading chefs from the
 * client was therefore silently denied by the default-deny rule.
 *
 * Every new read or write MUST go through these constants so the rules file,
 * the indexes file and the application code can never disagree again.
 */

export const COLLECTIONS = {
  // ─── Existing collections (already live in production) ───────────────
  /** Auth-backed user records. `users/{uid}.role` is the source of truth for roles. */
  USERS: 'users',
  /** Legacy mirror of USERS written by some older paths. Read-only going forward. */
  PROFILES: 'profiles',
  WAITLIST: 'waitlist',
  BOOKINGS: 'bookings',
  CONVERSATIONS: 'conversations',
  /** Subcollection under CONVERSATIONS. */
  MESSAGES: 'messages',
  CHEF_MEDIA: 'chef_media',
  CORPORATE_REQUESTS: 'corporate_requests',
  SUBSCRIPTIONS: 'subscriptions',

  /**
   * The public chef directory.
   *
   * NOTE: this is `chefs`, not `chef_profiles`. `chefs` is the collection the
   * live production code already writes to (see `/api/stripe/connect` and
   * `/api/bookings`), so it is the one we standardise on. Changing the live
   * collection name would orphan existing production documents.
   */
  CHEFS: 'chefs',

  // ─── New collections added by the onboarding + payments work ─────────
  /** A chef's application to join. One per applicant, doc id === applicant uid. */
  CHEF_APPLICATIONS: 'chef_applications',
  /** Verification state per applicant, doc id === applicant uid. */
  CHEF_VERIFICATION: 'chef_verification',
  /** Uploaded document metadata. Files themselves live in Cloud Storage. */
  CHEF_DOCUMENTS: 'chef_documents',
  /** Immutable payout ledger. Written server-side only, never by clients. */
  PAYOUTS: 'payouts',
  /** Append-only audit trail for admin decisions. */
  ADMIN_AUDIT: 'admin_audit',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]

/** Storage path helpers. Keep in step with `storage.rules`. */
export const STORAGE_PATHS = {
  /** Private. Identity and credential documents, readable only by owner + admin. */
  chefDocument: (uid: string, documentId: string, filename: string) =>
    `chef-documents/${uid}/${documentId}/${filename}`,
  /** Public. Portfolio and gallery images shown on a chef profile. */
  chefGallery: (uid: string, filename: string) => `chef-gallery/${uid}/${filename}`,
  /** Public. ChefTV video uploads. */
  chefMedia: (uid: string, filename: string) => `chef-media/${uid}/${filename}`,
} as const
