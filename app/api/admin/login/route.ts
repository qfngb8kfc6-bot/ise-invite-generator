import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionCookieValue,
  getAdminCredentials,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string
      password?: string
    }

    const username = body.username?.trim() || ''
    const password = body.password || ''

    const credentials = getAdminCredentials()

    if (!credentials.username || !credentials.password || !credentials.secret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Admin login is not configured. Set ADMIN_LOGIN_USERNAME, ADMIN_LOGIN_PASSWORD and ADMIN_SESSION_SECRET.',
        },
        { status: 500 }
      )
    }

    if (
      username !== credentials.username ||
      password !== credentials.password
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid username or password.' },
        { status: 401 }
      )
    }

    const sessionValue = await createAdminSessionCookieValue(username)
    const response = NextResponse.json({ ok: true })

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
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unable to sign in.' },
      { status: 400 }
    )
  }
}
