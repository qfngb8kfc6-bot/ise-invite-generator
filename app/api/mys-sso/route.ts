import { NextRequest, NextResponse } from 'next/server'
import { getExhibitorById } from '@/lib/exhibitors'
import { signExhibitorToken } from '@/lib/jwt'
import { logAnalyticsEvent } from '@/lib/analytics'
import { env } from '@/lib/env'
import { resolveMysSsoIdentity } from '@/lib/mys-sso'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function normaliseParam(value: string | null): string {
  return (value || '').trim()
}

export async function GET(request: NextRequest) {
  try {
    const valueGuid = normaliseParam(request.nextUrl.searchParams.get('valueguid'))
    const showId = normaliseParam(request.nextUrl.searchParams.get('showid'))

    if (!valueGuid || !showId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing valueguid or showid',
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const configuredShowCode = env.MYS_SHOWCODE?.trim()

    if (configuredShowCode && configuredShowCode !== showId) {
      return NextResponse.json(
        {
          ok: false,
          error: `SSO show mismatch. Received "${showId}" but app is configured for "${configuredShowCode}"`,
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const identity = await resolveMysSsoIdentity(valueGuid, showId)
    const exhibitor = await getExhibitorById(identity.exhibitorId)

    if (!exhibitor) {
      return NextResponse.json(
        {
          ok: false,
          error: `Exhibitor not found for ExhID ${identity.exhibitorId}`,
        },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const token = await signExhibitorToken(exhibitor.id)

    await logAnalyticsEvent({
      exhibitorId: exhibitor.id,
      companyName: exhibitor.companyName,
      eventType: 'session_verified',
    })

    const baseUrl = trimTrailingSlash(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    )

    const redirectUrl = `${baseUrl}/generator?token=${encodeURIComponent(token)}`

    return NextResponse.redirect(redirectUrl, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('MYS SSO ERROR:', error)

    const message =
      error instanceof Error ? error.message : 'MYS SSO login failed'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}