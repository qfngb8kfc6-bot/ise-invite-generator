import { getAnalyticsSummary } from '@/lib/analytics'

export type ActivityPoint = {
  date: string
  total: number
}

export type TopExhibitor = {
  exhibitorId: string
  companyName: string
  totalEvents: number
  exports: number
}

export type ExhibitorRow = {
  exhibitorId: string
  companyName: string
  totalEvents: number
  generatorOpens: number
  exports: number
  lastActivity: string | null
}

export type ReportsSummary = {
  query: string
  totalEvents: number
  exhibitorsSeen: number
  generatorOpens: number
  activityOverTime: ActivityPoint[]
  topExhibitors: TopExhibitor[]
  exhibitors: ExhibitorRow[]
}

function normaliseSearch(input?: string) {
  return (input || '').trim()
}

export async function getReportsSummary(search?: string): Promise<ReportsSummary> {
  const query = normaliseSearch(search)

  const summary = await getAnalyticsSummary({
    searchQuery: query || undefined,
  })

  const activityOverTime: ActivityPoint[] = summary.dailySeries.map((row) => ({
    date: row.date,
    total:
      Number(row.generatorOpened || 0) +
      Number(row.exportsSucceeded || 0) +
      Number(row.exportsFailed || 0),
  }))

  const topExhibitors: TopExhibitor[] = summary.exhibitorSummaries
    .map((row) => ({
      exhibitorId: row.exhibitorId,
      companyName: row.companyName,
      totalEvents: row.totalEvents,
      exports: row.exportSucceededCount,
    }))
    .sort((a, b) => {
      if (b.totalEvents !== a.totalEvents) {
        return b.totalEvents - a.totalEvents
      }

      return a.companyName.localeCompare(b.companyName)
    })
    .slice(0, 20)

  const exhibitors: ExhibitorRow[] = summary.exhibitorSummaries
    .map((row) => ({
      exhibitorId: row.exhibitorId,
      companyName: row.companyName,
      totalEvents: row.totalEvents,
      generatorOpens: row.generatorOpenedCount,
      exports: row.exportSucceededCount,
      lastActivity: row.lastActivityAt,
    }))
    .sort((a, b) => {
      if (b.totalEvents !== a.totalEvents) {
        return b.totalEvents - a.totalEvents
      }

      return a.companyName.localeCompare(b.companyName)
    })
    .slice(0, 100)

  return {
    query,
    totalEvents: summary.totalEvents,
    exhibitorsSeen: summary.totalExhibitors,
    generatorOpens: summary.totalGeneratorOpens,
    activityOverTime,
    topExhibitors,
    exhibitors,
  }
}