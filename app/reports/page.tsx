import ReportsClient from './ReportsClient'
import { requireAdminPage } from '@/lib/admin-guard'
import { getAnalyticsSummary } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Promise<{
    range?: string
    exhibitorId?: string
    q?: string
    startDate?: string
    endDate?: string
    flow?: string
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

function getFlowFilter(flow?: string): 'all' | 'primary' | 'secondary' {
  switch (flow) {
    case 'all':
      return 'all'
    case 'secondary':
      return 'secondary'
    case 'primary':
    default:
      return 'primary'
  }
}

export default async function ReportsPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const returnQuery = new URLSearchParams()
  for (const [key, value] of Object.entries(resolvedSearchParams ?? {})) {
    if (typeof value === 'string' && value) returnQuery.set(key, value)
  }
  const returnQueryString = returnQuery.toString()
  await requireAdminPage(`/reports${returnQueryString ? `?${returnQueryString}` : ''}`)

  const range = resolvedSearchParams?.range ?? 'all'
  const exhibitorId = resolvedSearchParams?.exhibitorId?.trim() || undefined
  const q = resolvedSearchParams?.q?.trim() || ''
  const startDate = resolvedSearchParams?.startDate?.trim() || undefined
  const endDate = resolvedSearchParams?.endDate?.trim() || undefined
  const flow = getFlowFilter(resolvedSearchParams?.flow)

  const rangeDays = hasCustomDateRange(startDate, endDate)
    ? undefined
    : getRangeDays(range)

  const summary = await getAnalyticsSummary({
    rangeDays,
    exhibitorId,
    searchQuery: q || undefined,
    startDate,
    endDate,
    flow,
  })

  const safeSummary = JSON.parse(JSON.stringify(summary))

  return (
    <ReportsClient
      summary={safeSummary}
      currentRange={range}
      currentExhibitorId={exhibitorId ?? null}
      currentSearchQuery={q}
      currentFlow={flow}
    />
  )
}