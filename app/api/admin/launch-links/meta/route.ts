import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { getAllExhibitors } from '@/lib/exhibitors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const exhibitors = await getAllExhibitors()

    return NextResponse.json(
      {
        ok: true,
        showCode: env.MYS_SHOWCODE || '',
        exhibitorDataSource: env.EXHIBITOR_DATA_SOURCE,
        allowMockFallback: env.ALLOW_MOCK_FALLBACK,
        isLiveMys:
          env.EXHIBITOR_DATA_SOURCE === 'mys' && env.ALLOW_MOCK_FALLBACK === false,
        exhibitorCount: exhibitors.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        showCode: env.MYS_SHOWCODE || '',
        exhibitorDataSource: env.EXHIBITOR_DATA_SOURCE,
        allowMockFallback: env.ALLOW_MOCK_FALLBACK,
        isLiveMys:
          env.EXHIBITOR_DATA_SOURCE === 'mys' && env.ALLOW_MOCK_FALLBACK === false,
        exhibitorCount: 0,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load export environment info',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}