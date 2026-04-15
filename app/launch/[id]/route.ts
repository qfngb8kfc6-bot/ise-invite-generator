import { NextRequest, NextResponse } from 'next/server'
import { getExhibitorById } from '@/lib/exhibitors'
import { signExhibitorToken } from '@/lib/jwt'
import { logAnalyticsEvent } from '@/lib/analytics'
import { verifyLaunch } from '@/lib/launch-signature'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const sig = request.nextUrl.searchParams.get('sig')

    if (!id || !sig) {
      return NextResponse.json(
        { ok: false, error: 'Missing id or signature' },
        { status: 400 }
      )
    }

    // 🔐 Verify signature
    if (!verifyLaunch(id, sig)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid signature' },
        { status: 403 }
      )
    }

    const exhibitor = await getExhibitorById(id)

    if (!exhibitor) {
      return NextResponse.json(
        { ok: false, error: 'Exhibitor not found' },
        { status: 404 }
      )
    }

    const token = await signExhibitorToken(exhibitor.id)

    await logAnalyticsEvent({
      exhibitorId: exhibitor.id,
      companyName: exhibitor.companyName,
      eventType: 'link_generated',
    })

    const baseUrl = trimTrailingSlash(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    )

    const url = `${baseUrl}/generator?token=${encodeURIComponent(token)}`

    return NextResponse.redirect(url)

  } catch (error) {
    console.error('LAUNCH ERROR:', error)

    return NextResponse.json(
      { ok: false, error: 'Launch failed' },
      { status: 500 }
    )
  }
}