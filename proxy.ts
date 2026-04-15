import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

function unauthorizedResponse() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Internal Tools"',
      'Cache-Control': 'no-store',
    },
  })
}

function decodeBasicAuthHeader(authHeader: string) {
  if (!authHeader.startsWith('Basic ')) {
    return null
  }

  const base64 = authHeader.slice('Basic '.length).trim()

  if (!base64) {
    return null
  }

  try {
    const decoded = Buffer.from(base64, 'base64').toString('utf8')
    const separatorIndex = decoded.indexOf(':')

    if (separatorIndex === -1) {
      return null
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return false
  }

  const credentials = decodeBasicAuthHeader(authHeader)

  if (!credentials) {
    return false
  }

  return (
    credentials.username === env.REPORTS_BASIC_AUTH_USERNAME &&
    credentials.password === env.REPORTS_BASIC_AUTH_PASSWORD
  )
}

export function proxy(request: NextRequest) {
  if (isAuthorized(request)) {
    return NextResponse.next()
  }

  return unauthorizedResponse()
}

export const config = {
  matcher: [
    '/reports/:path*',
    '/api/reports/:path*',
    '/tools/:path*',
    '/api/dev-token/:path*',
    '/api/internal-launch-link/:path*',
    '/admin/:path*',
  ],
}