import { NextRequest, NextResponse } from 'next/server'
import { getExhibitorById } from '@/lib/exhibitors'
import { verifyExhibitorToken } from '@/lib/jwt'
import { logAnalyticsEvent } from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normaliseToken(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const token = value
    .trim()
    .replace(/^["']+/, '')
    .replace(/["']+$/, '')
    .replace(/\s+/g, '')

  if (!token) {
    return null
  }

  return token
}

function isCompactJwt(token: string): boolean {
  return token.split('.').length === 3
}

async function extractToken(request: NextRequest): Promise<string | null> {
  if (request.method === 'GET') {
    return normaliseToken(request.nextUrl.searchParams.get('token'))
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json()
      return normaliseToken(body?.token)
    } catch {
      return null
    }
  }

  return null
}

async function handleSession(request: NextRequest) {
  try {
    const token = await extractToken(request)

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing token',
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    if (!isCompactJwt(token)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Malformed token received by session route (length: ${token.length})`,
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const payload = await verifyExhibitorToken(token)
    const exhibitor = await getExhibitorById(payload.exhibitorId)

    if (!exhibitor) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Exhibitor not found',
        },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    await logAnalyticsEvent({
      exhibitorId: exhibitor.id,
      companyName: exhibitor.companyName,
      eventType: 'session_verified',
    })

    await logAnalyticsEvent({
      exhibitorId: exhibitor.id,
      companyName: exhibitor.companyName,
      eventType: 'generator_opened',
    })

    return NextResponse.json(
      {
        ok: true,
        exhibitor,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('SESSION ERROR:', error)

    const message =
      error instanceof Error ? error.message : 'Invalid or expired token'

    return NextResponse.json(
      {
        ok: false,
        error:
          process.env.NODE_ENV === 'development'
            ? `Invalid or expired token: ${message}`
            : 'Invalid or expired token',
      },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleSession(request)
}

export async function POST(request: NextRequest) {
  return handleSession(request)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  })
}