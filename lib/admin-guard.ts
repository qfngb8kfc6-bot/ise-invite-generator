import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'

/**
 * Per-route admin checks. proxy.ts already guards the admin paths, but every
 * admin page and API route checks again here (defence in depth: a matcher
 * change can't silently expose a route).
 */

export function loginUrlFor(returnTo: string): string {
  return `/admin/login?redirect=${encodeURIComponent(returnTo)}`
}

/** Server Components: redirect to the login page (then back) if not signed in. */
export async function requireAdminPage(returnTo: string): Promise<void> {
  const cookieStore = await cookies()
  const isAdmin = await verifyAdminSessionCookieValue(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  )

  if (!isAdmin) {
    redirect(loginUrlFor(returnTo))
  }
}

/** API routes: returns a 401 response if not signed in, otherwise null. */
export async function requireAdminApi(
  request: NextRequest
): Promise<NextResponse | null> {
  const isAdmin = await verifyAdminSessionCookieValue(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  )

  return isAdmin ? null : adminUnauthorized()
}

export function adminUnauthorized(): NextResponse {
  return NextResponse.json(
    { ok: false, error: 'Admin authentication required.' },
    {
      status: 401,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  )
}
