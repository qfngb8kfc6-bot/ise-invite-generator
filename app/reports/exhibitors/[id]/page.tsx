import { notFound } from 'next/navigation'
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
  const params = await props.params
  const searchParams = props.searchParams ? await props.searchParams : {}

  const exhibitorId = params?.id?.trim()
  const range = searchParams?.range ?? 'all'
  const startDate = searchParams?.startDate?.trim() || undefined
  const endDate = searchParams?.endDate?.trim() || undefined

  if (!exhibitorId) {
    notFound()
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

  let exhibitor = summary.exhibitorSummaries.find(
    (item) => item.exhibitorId === exhibitorId
  )

  if (!exhibitor) {
    const allTimeSummary = await getAnalyticsSummary({
      exhibitorId,
    })

    const allTimeExhibitor = allTimeSummary.exhibitorSummaries.find(
      (item) => item.exhibitorId === exhibitorId
    )

    if (!allTimeExhibitor) {
      notFound()
    }

    exhibitor = {
      exhibitorId: allTimeExhibitor.exhibitorId,
      companyName: allTimeExhibitor.companyName,
      totalEvents: 0,
      linkGeneratedCount: 0,
      generatorOpenedCount: 0,
      sessionVerifiedCount: 0,
      exportClickedCount: 0,
      exportSucceededCount: 0,
      exportFailedCount: 0,
      lastActivityAt: null,
      formats: {},
      generatedLinkButNeverExported: false,
    }
  }

  return (
    <ExhibitorReportDetailClient
      exhibitor={exhibitor}
      summary={summary}
      currentRange={range}
    />
  )
}