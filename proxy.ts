import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'

/**
 * Central guard for the admin area (Next.js 16 "proxy", formerly middleware).
 * Pages and API routes ALSO check the session themselves (lib/admin-guard.ts);
 * this is the first line, not the only one.
 *
 *  admin pages  no valid session → redirect to /admin/login?redirect=<where they were going>
 *  admin APIs   no valid session → 401 JSON
 *
 * /admin/login and /api/admin/login|logout are deliberately not matched.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const signedIn = await verifyAdminSessionCookieValue(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  )

  if (!signedIn) {
    if (pathname.startsWith('/api/')) {
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

    const login = new URL('/admin/login', request.url)
    login.searchParams.set('redirect', `${pathname}${search}`)
    return NextResponse.redirect(login)
  }

  const response = NextResponse.next()
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export const config = {
  matcher: [
    '/reports',
    '/reports/:path*',
    '/api/reports/:path*',
    '/tools',
    '/tools/:path*',
    '/admin/links',
    '/api/admin/launch-links',
    '/api/admin/launch-links/:path*',
    '/api/exhibitor/:path*',
  ],
}
