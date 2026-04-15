import { NextRequest, NextResponse } from 'next/server'
import { getExhibitorById } from '@/lib/exhibitors'
import { signLaunch } from '@/lib/launch-signature'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function unauthorizedResponse() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Internal Tools"',
      'Cache-Control': 'no-store',
    },
  })
}

function isAuthorized(request: NextRequest): boolean {
  const expectedUsername = process.env.REPORTS_BASIC_AUTH_USERNAME?.trim()
  const expectedPassword = process.env.REPORTS_BASIC_AUTH_PASSWORD?.trim()

  if (!expectedUsername || !expectedPassword) {
    return process.env.NODE_ENV !== 'production'
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false
  }

  try {
    const base64Credentials = authHeader.slice('Basic '.length)
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8')
    const separatorIndex = decoded.indexOf(':')

    if (separatorIndex === -1) {
      return false
    }

    const username = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)

    return username === expectedUsername && password === expectedPassword
  } catch {
    return false
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params
    const exhibitorId = id?.trim()

    if (!exhibitorId) {
      return NextResponse.json(
        { ok: false, error: 'Missing exhibitor id' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const exhibitor = await getExhibitorById(exhibitorId)

    if (!exhibitor) {
      return NextResponse.json(
        { ok: false, error: `Exhibitor ${exhibitorId} not found` },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const baseUrl = trimTrailingSlash(
      process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'
    )

    const sig = signLaunch(exhibitor.id)
    const launchUrl = `${baseUrl}/launch/${encodeURIComponent(
      exhibitor.id
    )}?sig=${encodeURIComponent(sig)}`

    return NextResponse.json(
      {
        ok: true,
        exhibitorId: exhibitor.id,
        companyName: exhibitor.companyName,
        standNumber: exhibitor.standNumber,
        launchUrl,
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
    console.error('INTERNAL LAUNCH LINK ERROR:', error)

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate launch link',
      },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
}