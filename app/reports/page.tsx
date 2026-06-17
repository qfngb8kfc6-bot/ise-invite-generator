import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ReportsClient from './ReportsClient'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'
import { getAnalyticsSummary } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Promise<{
    range?: string
    exhibitorId?: string
    q?: string
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

export default async function ReportsPage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const isAdmin = await verifyAdminSessionCookieValue(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  )

  if (!isAdmin) {
    redirect('/admin/login?redirect=/reports')
  }

  const resolvedSearchParams = searchParams ? await searchParams : {}

  const range = resolvedSearchParams?.range ?? 'all'
  const exhibitorId = resolvedSearchParams?.exhibitorId?.trim() || undefined
  const q = resolvedSearchParams?.q?.trim() || ''
  const startDate = resolvedSearchParams?.startDate?.trim() || undefined
  const endDate = resolvedSearchParams?.endDate?.trim() || undefined

  const rangeDays = hasCustomDateRange(startDate, endDate)
    ? undefined
    : getRangeDays(range)

  const summary = await getAnalyticsSummary({
    rangeDays,
    exhibitorId,
    searchQuery: q || undefined,
    startDate,
    endDate,
  })

  const safeSummary = JSON.parse(JSON.stringify(summary))

  return (
    <ReportsClient
      summary={safeSummary}
      currentRange={range}
      currentExhibitorId={exhibitorId ?? null}
      currentSearchQuery={q}
    />
  )
}