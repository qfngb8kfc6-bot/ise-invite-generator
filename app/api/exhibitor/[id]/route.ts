import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-guard'
import { getExhibitorById } from '@/lib/exhibitors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Returns the full exhibitor record (invitation code, registration URL).
  // Only the admin /tools page calls it.
  const unauthorized = await requireAdminApi(request)
  if (unauthorized) return unauthorized

  try {
    const { id } = await context.params

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing exhibitor id',
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const exhibitor = await getExhibitorById(id.trim())

    if (!exhibitor) {
      return NextResponse.json(
        {
          ok: false,
          error: `Exhibitor ${id} not found`,
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
        ok: true,
        exhibitor,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('EXHIBITOR ROUTE ERROR:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to load exhibitor'

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