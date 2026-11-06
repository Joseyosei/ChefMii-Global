'use client'

/**
 * Client-side access to the chef directory.
 *
 * The directory UI renders a flat card shape (`DirectoryCard`). Previously
 * that shape was a hardcoded array inside `find-chefs/page.tsx`, so an
 * approved chef never appeared on the site. This fetches the live directory
 * from `/api/chefs` and maps it into the same shape, so the existing markup
 * keeps working unchanged.
 *
 * On any failure the seed catalogue is returned instead. A marketplace that
 * renders an empty grid looks broken to a visitor, which is worse than showing
 * the demo roster while the real data is unavailable.
 */

import { CHEF_PHOTO_FALLBACK, SEED_CHEFS } from './seed-catalogue'

/** The flat shape the directory cards consume. */
export interface DirectoryCard {
  id: string
  name: string
  cuisine: string
  rate: number
  rating: number
  reviews: number
  location: string
  badge: string
  bio: string
  photo: string
}

/** The public fields `/api/chefs` returns. */
interface ApiChef {
  id: string
  slug: string
  name: string
  bio: string
  cuisines: string[]
  specialties: string[]
  hourlyRate: number
  currency: string
  locationCity: string
  locationCountry: string
  photoUrl: string | null
  badgeTier: string
  avgRating: number | null
  totalReviews: number
  isVerified: boolean
}

const BADGE_LABELS: Record<string, string> = {
  elite: 'Elite Chef',
  pro: 'Pro Chef',
  verified: 'Verified',
}

function toCard(chef: ApiChef): DirectoryCard {
  return {
    // The slug is what /book/[chefId] and /chefs/[id] resolve against.
    id: chef.slug || chef.id,
    name: chef.name,
    cuisine: chef.cuisines[0] ?? 'Contemporary',
    rate: chef.hourlyRate,
    rating: chef.avgRating ?? 0,
    reviews: chef.totalReviews,
    location: [chef.locationCity, chef.locationCountry].filter(Boolean).join(', '),
    badge: chef.specialties[0] ?? BADGE_LABELS[chef.badgeTier] ?? 'Verified',
    bio: chef.bio,
    photo: chef.photoUrl || CHEF_PHOTO_FALLBACK,
  }
}

export interface DirectoryResult {
  chefs: DirectoryCard[]
  /** True when the seed catalogue is being shown rather than live data. */
  isFallback: boolean
}

/** Seed catalogue in card shape. Used as the initial render and as a fallback. */
export function seedCards(): DirectoryCard[] {
  return SEED_CHEFS.map((s) => ({ ...s }))
}

/**
 * Fetch the live directory.
 * Never throws: a failure resolves to the seed catalogue.
 */
export async function fetchDirectory(signal?: AbortSignal): Promise<DirectoryResult> {
  try {
    const res = await fetch('/api/chefs?limit=200', { signal })
    if (!res.ok) return { chefs: seedCards(), isFallback: true }

    const data = (await res.json()) as {
      success?: boolean
      chefs?: ApiChef[]
      isFallback?: boolean
    }

    if (!data.success || !Array.isArray(data.chefs) || data.chefs.length === 0) {
      return { chefs: seedCards(), isFallback: true }
    }

    return {
      chefs: data.chefs.map(toCard),
      isFallback: Boolean(data.isFallback),
    }
  } catch (err) {
    // An aborted request is a navigation, not an error worth reporting.
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { chefs: [], isFallback: false }
    }
    console.error('[directory-client] falling back to seed catalogue:', err)
    return { chefs: seedCards(), isFallback: true }
  }
}
