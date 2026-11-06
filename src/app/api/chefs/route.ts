/**
 * Public chef directory search.
 *
 *   GET /api/chefs?query=&cuisine=&minRate=&maxRate=&minRating=&city=&sortBy=&limit=
 *
 * No authentication: this is the public marketplace. Only chefs whose profile
 * is published (all three verification stages approved) are ever returned, and
 * the response carries no private fields.
 */

import { NextRequest, NextResponse } from 'next/server'
import { listChefs, type ChefQuery } from '@/lib/chefs/repository'

export const dynamic = 'force-dynamic'

type DirectoryChef = Awaited<ReturnType<typeof listChefs>>['chefs'][number]

/**
 * Strip payment and ownership fields before sending to a browser.
 *
 * Built as an allow-list rather than by deleting keys, so a field added to the
 * profile type later cannot leak by default.
 */
function toPublic(chef: DirectoryChef) {
  return {
    id: chef.id,
    slug: chef.slug,
    name: chef.name,
    bio: chef.bio,
    chefType: chef.chefType,
    cuisines: chef.cuisines,
    specialties: chef.specialties,
    yearsExperience: chef.yearsExperience,
    hourlyRate: chef.hourlyRate,
    currency: chef.currency,
    minGuests: chef.minGuests,
    maxGuests: chef.maxGuests,
    locationCity: chef.locationCity,
    locationCountry: chef.locationCountry,
    photoUrl: chef.photoUrl,
    galleryUrls: chef.galleryUrls,
    badgeTier: chef.badgeTier,
    avgRating: chef.avgRating,
    totalReviews: chef.totalReviews,
    isVerified: chef.isVerified,
    isAvailable: chef.isAvailable,
  }
}

function parseNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams

    const sortParam = sp.get('sortBy')
    const allowedSorts = ['recommended', 'price_asc', 'price_desc', 'rating', 'newest'] as const
    const sortBy = allowedSorts.includes(sortParam as never)
      ? (sortParam as ChefQuery['sortBy'])
      : 'recommended'

    const result = await listChefs({
      query: sp.get('query') ?? sp.get('q') ?? undefined,
      cuisine: sp.get('cuisine') ?? undefined,
      city: sp.get('city') ?? sp.get('location') ?? undefined,
      minRate: parseNumber(sp.get('minRate')),
      maxRate: parseNumber(sp.get('maxRate')),
      minRating: parseNumber(sp.get('minRating')),
      sortBy,
      limit: parseNumber(sp.get('limit')),
    })

    return NextResponse.json(
      {
        success: true,
        chefs: result.chefs.map(toPublic),
        total: result.total,
        isFallback: result.isFallback,
      },
      {
        headers: {
          // Short cache with revalidation: the directory changes rarely, but a
          // newly approved chef should appear within a minute.
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (error) {
    console.error('[api/chefs] search failed:', error)
    return NextResponse.json(
      { success: false, error: 'Could not load chefs right now. Please try again.' },
      { status: 500 },
    )
  }
}
