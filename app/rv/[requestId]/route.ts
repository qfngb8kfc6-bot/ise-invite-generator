import { NextRequest, NextResponse } from 'next/server'
import {
  buildSecondaryRegistrationUrl,
  getSecondaryInvitationRequestById,
} from '@/lib/google-sheets'
import { logAnalyticsEvent } from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params
    const cleanRequestId = requestId?.trim()

    if (!cleanRequestId) {
      return NextResponse.json(
        { ok: false, error: 'Missing visitor request id' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const invitationRequest =
      await getSecondaryInvitationRequestById(cleanRequestId)

    if (!invitationRequest) {
      return NextResponse.json(
        { ok: false, error: 'Visitor invitation request not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (!invitationRequest.assignedInvitationCode) {
      return NextResponse.json(
        { ok: false, error: 'Visitor invitation code is missing' },
        { status: 409, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const registrationUrl = buildSecondaryRegistrationUrl(
      invitationRequest.assignedInvitationCode
    )

    await logAnalyticsEvent({
      exhibitorId: `secondary:${invitationRequest.requestId}`,
      companyName: invitationRequest.companyName,
      eventType: 'qr_scanned',
      metadata: {
        flow: 'secondary',
        source: 'visitor_qr_redirect',
        invitationCode: invitationRequest.assignedInvitationCode,
        userAgent: request.headers.get('user-agent') || null,
        referer: request.headers.get('referer') || null,
      },
    })

    return NextResponse.redirect(registrationUrl, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('VISITOR QR REDIRECT ERROR:', error)

    return NextResponse.json(
      { ok: false, error: 'Visitor QR redirect failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
