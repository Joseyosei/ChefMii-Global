/**
 * Server-side data access for the chef directory.
 *
 * SERVER ONLY — this imports firebase-admin. Importing it from a Client
 * Component will break the build. Client code should call `/api/chefs`.
 *
 * Design notes:
 *  - Firestore has no full-text search, so a text query is applied in memory
 *    after a bounded fetch. That is correct for the current roster size; past a
 *    few thousand published chefs this should move to Algolia or Typesense.
 *  - Every read is wrapped so a missing composite index or a cold database
 *    degrades to the seed catalogue instead of throwing a 500 at a visitor.
 */

import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { toIsoRequired, toNumber, toStringArray } from '@/lib/firebase/serialize'
import type { ChefBadgeTier, ChefDirectoryProfile, ChefType } from '@/types/onboarding'
import { SEED_CHEFS, type SeedChef } from './seed-catalogue'

export interface ChefQuery {
  /** Free text matched against name, cuisine, city and bio. */
  query?: string
  /** Cuisine name, or 'All'. */
  cuisine?: string
  minRate?: number
  maxRate?: number
  minRating?: number
  city?: string
  sortBy?: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
  limit?: number
}

export interface ChefQueryResult {
  chefs: ChefDirectoryProfile[]
  total: number
  /** True when results came from the seed catalogue rather than Firestore. */
  isFallback: boolean
}

const DEFAULT_LIMIT = 48
const MAX_FETCH = 500

/** List published chefs. Falls back to the seed catalogue when Firestore is empty. */
export async function listChefs(filters: ChefQuery = {}): Promise<ChefQueryResult> {
  const live = await fetchPublishedChefs()

  const source = live.length > 0 ? live : SEED_CHEFS.map(seedToProfile)
  const isFallback = live.length === 0

  const filtered = applyFilters(source, filters)
  const sorted = applySort(filtered, filters.sortBy ?? 'recommended')
  const limit = clamp(filters.limit ?? DEFAULT_LIMIT, 1, MAX_FETCH)

  return {
    chefs: sorted.slice(0, limit),
    total: sorted.length,
    isFallback,
  }
}

/** Fetch one chef by document id or slug. Returns null when not found. */
export async function getChef(idOrSlug: string): Promise<ChefDirectoryProfile | null> {
  if (!idOrSlug) return null

  try {
    const byId = await adminDb.collection(COLLECTIONS.CHEFS).doc(idOrSlug).get()
    if (byId.exists) {
      const profile = docToProfile(byId.id, byId.data() ?? {})
      // An unpublished profile is only visible through the chef's own dashboard,
      // which reads it directly rather than through this function.
      if (profile.isPublished) return profile
    }

    const bySlug = await adminDb
      .collection(COLLECTIONS.CHEFS)
      .where('slug', '==', idOrSlug)
      .limit(1)
      .get()

    if (!bySlug.empty) {
      const doc = bySlug.docs[0]
      const profile = docToProfile(doc.id, doc.data())
      if (profile.isPublished) return profile
    }
  } catch (err) {
    console.error('[chefs/repository] getChef lookup failed:', err)
  }

  // Fall back to the seed catalogue so demo links on the live site keep working.
  const seed = SEED_CHEFS.find((c) => c.id === idOrSlug)
  return seed ? seedToProfile(seed) : null
}

/** Chefs for the homepage featured strip. */
export async function listFeaturedChefs(count = 4): Promise<ChefDirectoryProfile[]> {
  const { chefs } = await listChefs({ sortBy: 'rating', limit: count })
  return chefs
}

// ─── Internals ─────────────────────────────────────────────────────────

async function fetchPublishedChefs(): Promise<ChefDirectoryProfile[]> {
  try {
    const snap = await adminDb
      .collection(COLLECTIONS.CHEFS)
      .where('isPublished', '==', true)
      .limit(MAX_FETCH)
      .get()

    return snap.docs.map((d) => docToProfile(d.id, d.data()))
  } catch (err) {
    // A FAILED_PRECONDITION here almost always means the composite index in
    // firestore.indexes.json has not been deployed yet.
    console.error('[chefs/repository] published chef query failed:', err)
    return []
  }
}

function applyFilters(chefs: ChefDirectoryProfile[], f: ChefQuery): ChefDirectoryProfile[] {
  let out = chefs

  if (f.cuisine && f.cuisine !== 'All') {
    const needle = f.cuisine.toLowerCase()
    out = out.filter((c) => c.cuisines.some((x) => x.toLowerCase() === needle))
  }

  if (f.city) {
    const needle = f.city.toLowerCase()
    out = out.filter(
      (c) =>
        c.locationCity.toLowerCase().includes(needle) ||
        c.locationCountry.toLowerCase().includes(needle),
    )
  }

  if (typeof f.minRate === 'number') out = out.filter((c) => c.hourlyRate >= f.minRate!)
  if (typeof f.maxRate === 'number') out = out.filter((c) => c.hourlyRate <= f.maxRate!)
  if (typeof f.minRating === 'number') out = out.filter((c) => (c.avgRating ?? 0) >= f.minRating!)

  if (f.query?.trim()) {
    const needle = f.query.trim().toLowerCase()
    out = out.filter((c) =>
      [c.name, c.bio, c.locationCity, c.locationCountry, ...c.cuisines, ...c.specialties]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }

  return out
}

function applySort(
  chefs: ChefDirectoryProfile[],
  sortBy: NonNullable<ChefQuery['sortBy']>,
): ChefDirectoryProfile[] {
  const out = [...chefs]
  switch (sortBy) {
    case 'price_asc':
      return out.sort((a, b) => a.hourlyRate - b.hourlyRate)
    case 'price_desc':
      return out.sort((a, b) => b.hourlyRate - a.hourlyRate)
    case 'rating':
      return out.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    case 'newest':
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'recommended':
    default:
      // Rating first, then review volume, so a lone 5.0 does not outrank a
      // well-reviewed 4.9.
      return out.sort((a, b) => {
        const byRating = (b.avgRating ?? 0) - (a.avgRating ?? 0)
        if (Math.abs(byRating) > 0.05) return byRating
        return b.totalReviews - a.totalReviews
      })
  }
}

/** Map a Firestore document to the directory shape, tolerating legacy fields. */
export function docToProfile(id: string, data: Record<string, unknown>): ChefDirectoryProfile {
  // Older documents used snake_case (hourly_rate, avg_rating). Read both.
  const pick = <T>(camel: string, snake: string, fallback: T): T =>
    (data[camel] as T) ?? (data[snake] as T) ?? fallback

  return {
    id,
    userId: pick<string>('userId', 'user_id', id),
    slug: (data.slug as string) || id,
    name: pick<string>('name', 'full_name', 'ChefMii Chef'),
    bio: (data.bio as string) || '',
    chefType: ((data.chefType as ChefType) ?? 'independent') as ChefType,
    cuisines: toStringArray(data.cuisines ?? data.cuisine_types),
    specialties: toStringArray(data.specialties),
    yearsExperience: toNumber(pick('yearsExperience', 'years_experience', 0)),
    hourlyRate: toNumber(pick('hourlyRate', 'hourly_rate', 0)),
    currency: (data.currency as string) || 'GBP',
    minGuests: toNumber(pick('minGuests', 'min_guests', 2)),
    maxGuests: toNumber(pick('maxGuests', 'max_guests', 12)),
    locationCity: pick<string>('locationCity', 'location_city', ''),
    locationCountry: pick<string>('locationCountry', 'location_country', ''),
    photoUrl: pick<string | null>('photoUrl', 'photo_url', null),
    galleryUrls: toStringArray(data.galleryUrls ?? data.gallery_urls),
    badgeTier: ((data.badgeTier as ChefBadgeTier) ?? 'verified') as ChefBadgeTier,
    avgRating: (() => {
      const raw = pick<unknown>('avgRating', 'avg_rating', null)
      return raw == null ? null : toNumber(raw)
    })(),
    totalReviews: toNumber(pick('totalReviews', 'total_reviews', 0)),
    isVerified: Boolean(pick('isVerified', 'is_verified', false)),
    isAvailable: Boolean(pick('isAvailable', 'is_available', true)),
    isPublished: Boolean(data.isPublished ?? false),
    stripeAccountId: pick<string | null>('stripeAccountId', 'stripe_account_id', null),
    stripeStatus: (pick<string>('stripeStatus', 'stripe_status', 'none') ||
      'none') as ChefDirectoryProfile['stripeStatus'],
    chargesEnabled: Boolean(pick('chargesEnabled', 'charges_enabled', false)),
    payoutsEnabled: Boolean(pick('payoutsEnabled', 'payouts_enabled', false)),
    createdAt: toIsoRequired(data.createdAt ?? data.created_at),
    updatedAt: toIsoRequired(data.updatedAt ?? data.updated_at),
  }
}

/** Map a seed record to the directory shape. Exported for the seed script. */
export function seedToProfile(seed: SeedChef): ChefDirectoryProfile {
  const [city, ...countryParts] = seed.location.split(',').map((s) => s.trim())
  const badgeTier: ChefBadgeTier =
    seed.rating >= 4.9 ? 'elite' : seed.rating >= 4.7 ? 'pro' : 'verified'

  return {
    id: seed.id,
    userId: seed.id,
    slug: seed.id,
    name: seed.name,
    bio: seed.bio,
    chefType: 'professional',
    cuisines: [seed.cuisine],
    specialties: [seed.badge],
    yearsExperience: 0,
    hourlyRate: seed.rate,
    currency: 'GBP',
    minGuests: 2,
    maxGuests: 12,
    locationCity: city ?? '',
    locationCountry: countryParts.join(', '),
    photoUrl: seed.photo,
    galleryUrls: [],
    badgeTier,
    avgRating: seed.rating,
    totalReviews: seed.reviews,
    isVerified: true,
    isAvailable: true,
    isPublished: true,
    stripeAccountId: null,
    stripeStatus: 'none',
    chargesEnabled: false,
    payoutsEnabled: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
