import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  checkAdminCredentials,
  createAdminSessionCookieValue,
  getAdminCredentials,
  safeRedirectTarget,
} from '@/lib/admin-auth'
import {
  clientIp,
  loginBlockedFor,
  recordLoginFailure,
  recordLoginSuccess,
} from '@/lib/login-rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
}

export async function POST(request: Request) {
  const credentials = getAdminCredentials()

  if (!credentials.username || !credentials.password || !credentials.secret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Admin login is not configured. Set ADMIN_LOGIN_USERNAME, ADMIN_LOGIN_PASSWORD and ADMIN_SESSION_SECRET.',
      },
      { status: 500, headers: NO_STORE }
    )
  }

  const ip = clientIp(request)
  const waitSeconds = loginBlockedFor(ip)

  if (waitSeconds > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many failed attempts. Try again in ${Math.ceil(waitSeconds / 60)} minute(s).`,
      },
      {
        status: 429,
        headers: { ...NO_STORE, 'Retry-After': String(waitSeconds) },
      }
    )
  }

  let body: { username?: unknown; password?: unknown; redirect?: unknown }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unable to sign in.' },
      { status: 400, headers: NO_STORE }
    )
  }

  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '')

  if (!(await checkAdminCredentials(username, password))) {
    recordLoginFailure(ip)
    console.warn('[ADMIN LOGIN] Failed attempt', JSON.stringify({ ip }))

    return NextResponse.json(
      { ok: false, error: 'Invalid username or password.' },
      { status: 401, headers: NO_STORE }
    )
  }

  recordLoginSuccess(ip)

  const sessionValue = await createAdminSessionCookieValue(credentials.username)
  const response = NextResponse.json(
    { ok: true, redirect: safeRedirectTarget(String(body?.redirect ?? '')) },
    { headers: NO_STORE }
  )

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionValue,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}
