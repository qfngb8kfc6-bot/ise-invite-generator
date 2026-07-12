import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'
import { getAnalyticsSummary } from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getRangeDays(range?: string | null): number | undefined {
  switch (range) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    default:
      return undefined
  }
}

function formatRangeLabel(range?: string | null): string {
  switch (range) {
    case '7d':
      return 'last-7-days'
    case '30d':
      return 'last-30-days'
    case '90d':
      return 'last-90-days'
    default:
      return 'all-time'
  }
}

function percentage(numerator: number, denominator: number): string {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''

  const stringValue = String(value)

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function hasCustomDateRange(startDate?: string | null, endDate?: string | null): boolean {
  return Boolean(startDate?.trim() || endDate?.trim())
}

function getFlowFilter(flow?: string | null): 'all' | 'primary' | 'secondary' {
  switch (flow) {
    case 'primary':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'all':
    default:
      return 'all'
  }
}

function formatFlowLabel(flow: 'all' | 'primary' | 'secondary'): string {
  switch (flow) {
    case 'primary':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'all':
    default:
      return 'all'
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSessionCookieValue(
      request.cookies.get(ADMIN_COOKIE_NAME)?.value
    )

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Admin authentication required.' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const range = request.nextUrl.searchParams.get('range')
    const exhibitorId = request.nextUrl.searchParams.get('exhibitorId')
    const q = request.nextUrl.searchParams.get('q')
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')
    const flow = getFlowFilter(request.nextUrl.searchParams.get('flow'))

    const rangeDays = hasCustomDateRange(startDate, endDate)
      ? undefined
      : getRangeDays(range)

    const summary = await getAnalyticsSummary({
      rangeDays,
      exhibitorId: exhibitorId?.trim() || undefined,
      searchQuery: q?.trim() || undefined,
      startDate: startDate?.trim() || undefined,
      endDate: endDate?.trim() || undefined,
      flow,
    })

    const headers = [
      'companyName',
      'exhibitorId',
      'totalEvents',
      'linkGeneratedCount',
      'generatorOpenedCount',
      'sessionVerifiedCount',
      'exportClickedCount',
      'exportSucceededCount',
      'exportFailedCount',
      'conversionRate',
      'generatedLinkButNeverExported',
      'pngLinkedInCount',
      'pngFullSizeCount',
      'pngEmailCount',
      'pngPrintCount',
      'pdfCount',
      'zipCount',
      'lastActivityAt',
    ]

    const rows = summary.exhibitorSummaries.map((item) => ({
      companyName: item.companyName,
      exhibitorId: item.exhibitorId,
      totalEvents: item.totalEvents,
      linkGeneratedCount: item.linkGeneratedCount,
      generatorOpenedCount: item.generatorOpenedCount,
      sessionVerifiedCount: item.sessionVerifiedCount,
      exportClickedCount: item.exportClickedCount,
      exportSucceededCount: item.exportSucceededCount,
      exportFailedCount: item.exportFailedCount,
      conversionRate: percentage(
        item.exportSucceededCount,
        item.generatorOpenedCount
      ),
      generatedLinkButNeverExported: item.generatedLinkButNeverExported ? 'yes' : 'no',
      pngLinkedInCount: item.formats['png-linkedin'] ?? 0,
      pngSquareCount: item.formats['png-square'] ?? 0,
      pngEmailCount: item.formats['png-email'] ?? 0,
      pngPrintCount: item.formats['png-print'] ?? 0,
      pdfCount: item.formats['pdf'] ?? 0,
      zipCount: item.formats['zip'] ?? 0,
      lastActivityAt: item.lastActivityAt ?? '',
    }))

    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => escapeCsv((row as any)[header])).join(',')
      ),
    ]

    const csv = csvLines.join('\n')

    const customSuffix =
      startDate || endDate
        ? `-${startDate || 'open'}-to-${endDate || 'open'}`
        : ''

    const flowSuffix = flow === 'all' ? '' : `-${formatFlowLabel(flow)}`
    const fileName = `exhibitor-report-${formatRangeLabel(range)}${customSuffix}${flowSuffix}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('CSV REPORT ERROR:', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to generate CSV report',
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