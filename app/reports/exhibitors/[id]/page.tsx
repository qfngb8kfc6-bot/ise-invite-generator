import Link from 'next/link'
import { getAnalyticsSummary } from '@/lib/analytics'
import ExhibitorReportDetailClient from './ExhibitorReportDetailClient'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    range?: string
    startDate?: string
    endDate?: string
  }>
}

function getRangeDays(range?: string): number | undefined {
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

function hasCustomDateRange(startDate?: string, endDate?: string): boolean {
  return Boolean(startDate?.trim() || endDate?.trim())
}

export default async function ExhibitorReportDetailPage(props: Props) {
  try {
    const params = await props.params
    const searchParams = props.searchParams ? await props.searchParams : {}

    const exhibitorId = params?.id?.trim()
    const range = searchParams?.range ?? 'all'
    const startDate = searchParams?.startDate?.trim() || undefined
    const endDate = searchParams?.endDate?.trim() || undefined

    if (!exhibitorId) {
      throw new Error('Missing exhibitor id')
    }

    const rangeDays = hasCustomDateRange(startDate, endDate)
      ? undefined
      : getRangeDays(range)

    const summary = await getAnalyticsSummary({
      rangeDays,
      exhibitorId,
      startDate,
      endDate,
    })

    const exhibitor = summary.exhibitorSummaries.find(
      (item) => item.exhibitorId === exhibitorId
    )

    if (!exhibitor) {
      throw new Error(`No analytics found for exhibitor ${exhibitorId}`)
    }

    return (
      <ExhibitorReportDetailClient
        exhibitor={exhibitor}
        summary={summary}
        currentRange={range}
      />
    )
  } catch (error) {
    console.error('EXHIBITOR REPORT DETAIL ERROR:', error)

    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-2xl font-semibold">Exhibitor report unavailable</h1>
          <p className="mt-3 text-sm text-red-200">
            This exhibitor detail report could not be loaded. The main reports dashboard is still available.
          </p>
          <Link
            href="/reports"
            className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Back to reports
          </Link>
        </div>
      </main>
    )
  }
}
