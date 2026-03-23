import { NextRequest, NextResponse } from 'next/server'
import { getExhibitorById } from '@/lib/exhibitors'
import { signExhibitorToken } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        ok: false,
        error: 'Not available in production',
      },
      {
        status: 403,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

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

    const exhibitor = getExhibitorById(id.trim())

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

    const token = await signExhibitorToken(exhibitor.id)

    const baseUrl = trimTrailingSlash(
      process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'
    )

    const generatorUrl = `${baseUrl}/generator?token=${encodeURIComponent(token)}`

    return NextResponse.json(
      {
        ok: true,
        exhibitorId: exhibitor.id,
        token,
        tokenLength: token.length,
        generatorUrl,
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
    console.error('DEV TOKEN ERROR:', error)

    const message =
      error instanceof Error ? error.message : 'Unknown token generation error'

    return NextResponse.json(
      {
        ok: false,
        error:
          process.env.NODE_ENV === 'development'
            ? `Failed to generate token: ${message}`
            : 'Failed to generate token',
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return GET(request, context)
}