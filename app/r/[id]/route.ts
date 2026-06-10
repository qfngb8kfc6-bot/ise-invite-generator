import { NextRequest, NextResponse } from 'next/server'
import { getExhibitorById } from '@/lib/exhibitors'
import { logAnalyticsEvent } from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
        { ok: false, error: 'Exhibitor not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    await logAnalyticsEvent({
      exhibitorId: exhibitor.id,
      companyName: exhibitor.companyName,
      eventType: 'qr_scanned',
      metadata: {
        source: 'qr_redirect',
        userAgent: request.headers.get('user-agent') || null,
        referer: request.headers.get('referer') || null,
      },
    })

    return NextResponse.redirect(exhibitor.registrationUrl, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('QR REDIRECT ERROR:', error)

    return NextResponse.json(
      { ok: false, error: 'QR redirect failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
