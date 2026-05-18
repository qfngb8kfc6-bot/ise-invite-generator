import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getBooleanEnv(name: string, fallback = false): boolean {
  const value = process.env[name]?.trim().toLowerCase()

  if (!value) return fallback

  return value === 'true' || value === '1' || value === 'yes'
}

export async function GET() {
  const exhibitorDataSource =
    process.env.EXHIBITOR_DATA_SOURCE?.trim() === 'mys' ? 'mys' : 'mock'

  const allowMockFallback = getBooleanEnv('ALLOW_MOCK_FALLBACK', true)
  const showCode = process.env.MYS_SHOWCODE?.trim() || ''

  try {
    const { getAllExhibitors } = await import('@/lib/exhibitors')
    const exhibitors = await getAllExhibitors()

    return NextResponse.json(
      {
        ok: true,
        showCode,
        exhibitorDataSource,
        allowMockFallback,
        isLiveMys: exhibitorDataSource === 'mys' && allowMockFallback === false,
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
        showCode,
        exhibitorDataSource,
        allowMockFallback,
        isLiveMys: exhibitorDataSource === 'mys' && allowMockFallback === false,
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
