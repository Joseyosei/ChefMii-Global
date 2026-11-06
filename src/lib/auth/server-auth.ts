/**
 * Server-side authentication and authorisation for API routes.
 *
 * SECURITY NOTE — this file exists to close a real hole.
 * The previous `/api/bookings` and `/api/stripe/connect` handlers verified the
 * Bearer token inside a try/catch, logged a warning on failure, and then fell
 * back to `body.userId` / `body.chefId`. That meant an unauthenticated caller
 * could POST any uid and act as that user: create bookings in someone else's
 * name, or mint a Stripe Connect onboarding link against another chef's
 * account. Identity must come from a verified Firebase ID token and nothing
 * else, so there is deliberately no body fallback anywhere below.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'
import type { RoleType } from '@/types/database'

export interface AuthedUser {
  uid: string
  email: string | null
  role: RoleType
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Extract and verify the Firebase ID token on a request.
 * Throws AuthError(401) when absent or invalid. Never falls back to the body.
 */
export async function requireAuth(request: NextRequest): Promise<AuthedUser> {
  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Authentication required. Send a Firebase ID token as a Bearer header.', 401)
  }

  const idToken = authHeader.slice('Bearer '.length).trim()
  if (!idToken) {
    throw new AuthError('Authentication required. Bearer token was empty.', 401)
  }

  let decoded
  try {
    // checkRevoked: a signed-out or disabled account must stop working at once.
    decoded = await adminAuth.verifyIdToken(idToken, true)
  } catch {
    throw new AuthError('Your session has expired or is invalid. Please sign in again.', 401)
  }

  const role = await resolveRole(decoded.uid, decoded.role as string | undefined)

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    role,
  }
}

/**
 * Resolve a user's role. A custom claim wins when present (it is signed and
 * cannot be edited by the client); otherwise we fall back to
 * `users/{uid}.role`, which is what the current app writes.
 */
async function resolveRole(uid: string, claimRole?: string): Promise<RoleType> {
  const valid: RoleType[] = ['client', 'chef', 'business', 'admin', 'kids', 'influencer', 'farmer']

  if (claimRole && valid.includes(claimRole as RoleType)) {
    return claimRole as RoleType
  }

  try {
    const snap = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get()
    const role = snap.data()?.role
    if (typeof role === 'string' && valid.includes(role as RoleType)) {
      return role as RoleType
    }
  } catch (err) {
    console.error('[server-auth] role lookup failed for', uid, err)
  }

  return 'client'
}

/** Require a verified user holding one of `roles`. */
export async function requireRole(
  request: NextRequest,
  roles: RoleType[],
): Promise<AuthedUser> {
  const user = await requireAuth(request)
  if (!roles.includes(user.role)) {
    throw new AuthError('You do not have permission to perform this action.', 403)
  }
  return user
}

/** Require an admin. */
export async function requireAdmin(request: NextRequest): Promise<AuthedUser> {
  return requireRole(request, ['admin'])
}

/**
 * Translate a thrown error into a response.
 * AuthError keeps its status and message; anything else becomes a generic 500
 * so internal details never reach the client.
 */
export function toErrorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status })
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: error.message, fieldErrors: error.fieldErrors },
      { status: 400 },
    )
  }

  console.error(`[${context}]`, error)
  return NextResponse.json(
    { success: false, error: 'Something went wrong on our side. Please try again.' },
    { status: 500 },
  )
}

export class ValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Verify a scheduled-job request (used by the payout cron).
 *
 * The previous payout handler only checked the key when one was *supplied*:
 * `if (apiKey && apiKey !== secret) reject`. Omitting the header entirely
 * passed the check, leaving the endpoint open to anyone. This requires it, and
 * also accepts Vercel Cron's own Authorization header.
 */
export function requireCronAuth(request: NextRequest): void {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    throw new AuthError('CRON_SECRET is not configured on the server.', 403)
  }

  const apiKey = request.headers.get('x-api-key')
  const bearer = request.headers.get('Authorization')

  const viaApiKey = apiKey !== null && timingSafeEqual(apiKey, secret)
  const viaBearer = bearer !== null && timingSafeEqual(bearer, `Bearer ${secret}`)

  if (!viaApiKey && !viaBearer) {
    throw new AuthError('Unauthorized scheduled request.', 401)
  }
}

/** Constant-time string compare, so a wrong key cannot be found byte by byte. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
