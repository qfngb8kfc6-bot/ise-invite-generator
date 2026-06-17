import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'

function isPublicAdminPath(pathname: string) {
  return (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  )
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL('/admin/login', request.url)
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  loginUrl.searchParams.set('redirect', currentPath)

  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next()
  }

  const isAdmin = await isAdminRequest(request)

  if (isAdmin) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { ok: false, error: 'Admin authentication required.' },
      { status: 401 }
    )
  }

  return buildLoginRedirect(request)
}

export const config = {
  matcher: [
    '/reports/:path*',
    '/api/reports/:path*',
    '/tools/:path*',
    '/api/dev-token/:path*',
    '/api/internal-launch-link/:path*',
    '/api/admin/:path*',
    '/admin/:path*',
  ],
}
