'use client'

/**
 * Authenticated client-side API helper.
 *
 * Every write endpoint now requires a verified Firebase ID token (see
 * `src/lib/auth/server-auth.ts`), so client calls must attach one. Previously
 * callers passed `userId` in the request body and the server trusted it, which
 * was the auth bypass this replaces.
 *
 * Note on demo sessions: `auth-context` supports a localStorage-only session
 * (`isLocalSession`) with no Firebase user behind it. Those sessions have no ID
 * token and cannot call authenticated endpoints. That is intentional — a demo
 * login must not be able to move money — and `NotSignedInError` gives the UI a
 * specific case to message rather than a generic failure.
 */

import { auth } from '@/lib/firebase/client'

export class NotSignedInError extends Error {
  constructor(message = 'Please sign in with your ChefMii account to continue.') {
    super(message)
    this.name = 'NotSignedInError'
  }
}

export interface ApiResult<T> {
  ok: boolean
  status: number
  data: T | null
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

/** Current user's ID token, or null when there is no real Firebase session. */
export async function getIdToken(): Promise<string | null> {
  const current = auth.currentUser
  if (!current) return null
  try {
    return await current.getIdToken()
  } catch (err) {
    console.error('[api-client] could not get ID token:', err)
    return null
  }
}

/**
 * Fetch an authenticated endpoint and normalise the outcome.
 * Throws NotSignedInError when no real session exists; never throws on an
 * HTTP error, so callers can render the message instead of a crash.
 */
export async function apiFetch<T = unknown>(
  input: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = await getIdToken()
  if (!token) throw new NotSignedInError()

  let response: Response
  try {
    response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Network problem. Check your connection and try again.',
      fieldErrors: null,
    }
  }

  const payload = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & {
        success?: boolean
        error?: string
        fieldErrors?: Record<string, string[]>
      })
    | null

  const ok = response.ok && payload?.success !== false

  return {
    ok,
    status: response.status,
    data: ok ? ((payload ?? null) as T | null) : null,
    error: ok
      ? null
      : ((payload?.error as string) ??
        (response.status === 401
          ? 'Your session has expired. Please sign in again.'
          : 'Something went wrong. Please try again.')),
    fieldErrors: (payload?.fieldErrors as Record<string, string[]> | undefined) ?? null,
  }
}

/** Raw authenticated fetch, for callers that need the Response itself. */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken()
  if (!token) throw new NotSignedInError()

  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
}
