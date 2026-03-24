import { NextRequest, NextResponse } from 'next/server'
import { getAllExhibitors } from '@/lib/exhibitors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const exhibitors = await getAllExhibitors()
  const exhibitor = exhibitors.find((item) => item.id === id)

  if (!exhibitor) {
    return NextResponse.json(
      {
        ok: false,
        error: `Mock EBO exhibitor ${id} not found`,
      },
      {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  return NextResponse.json(
    {
      exhibitor: {
        exhibitor_id: exhibitor.id,
        company_name: exhibitor.companyName,
        stand_number: exhibitor.standNumber,
        invitation_code: exhibitor.invitationCode,
        registration_url: exhibitor.registrationUrl,
        logo_url: exhibitor.logoUrl,
        theme: exhibitor.theme,
        language: exhibitor.language,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}