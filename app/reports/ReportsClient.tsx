'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import MeasuredChart from '@/components/charts/MeasuredChart'

type ExhibitorSummary = {
  exhibitorId: string
  companyName: string
  totalEvents: number
  linkGeneratedCount: number
  generatorOpenedCount: number
  sessionVerifiedCount: number
  exportClickedCount: number
  exportSucceededCount: number
  exportFailedCount: number
  lastActivityAt: string | null
  formats: Record<string, number>
  generatedLinkButNeverExported: boolean
}

type DailySeriesRow = {
  date: string
  generatorOpened: number
  exportsSucceeded: number
  exportsFailed: number
}

type AvailableExhibitor = {
  exhibitorId: string
  companyName: string
}

type RecentEvent = {
  id: string
  timestamp: string
  companyName: string
  exhibitorId: string
  eventType: string
  format: string | null
  environment: string
}

type FunnelStep = {
  key:
    | 'link_generated'
    | 'generator_opened'
    | 'session_verified'
    | 'export_clicked'
    | 'export_succeeded'
    | 'export_failed'
  label: string
  count: number
  rateFromPrevious: string
  rateFromStart: string
}

type FunnelSummary = {
  steps: FunnelStep[]
  starts: number
}

type Summary = {
  totalEvents: number
  totalExhibitors: number
  totalExportsSucceeded: number
  totalExportsFailed: number
  totalGeneratorOpens: number
  conversionRate: string
  formatUsage: Record<string, number>
  exhibitorSummaries: ExhibitorSummary[]
  recentEvents: RecentEvent[]
  dailySeries: DailySeriesRow[]
  availableExhibitors: AvailableExhibitor[]
  appliedExhibitorId: string | null
  appliedExhibitorName: string | null
  appliedSearchQuery: string | null
  appliedStartDate: string | null
  appliedEndDate: string | null
  funnel: FunnelSummary
}

type Props = {
  summary: Summary
  currentRange: string
  currentExhibitorId: string | null
  currentSearchQuery: string
}

type SortKey =
  | 'companyName'
  | 'exhibitorId'
  | 'totalEvents'
  | 'generatorOpenedCount'
  | 'exportSucceededCount'
  | 'exportFailedCount'
  | 'conversionRate'
  | 'lastActivityAt'

type SortDirection = 'asc' | 'desc'

type FocusFilter =
  | 'all'
  | 'needsAttention'
  | 'zeroConversion'
  | 'failedExports'
  | 'topPerformers'

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
] as const

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  try {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
      date.getUTCDate()
    )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
      date.getUTCSeconds()
    )} UTC`
  } catch {
    return value
  }
}

function formatShortDate(value: string): string {
  try {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}`
  } catch {
    return value
  }
}

function formatFormatLabel(format: string): string {
  switch (format) {
    case 'png-linkedin':
      return 'PNG LinkedIn'
    case 'png-square':
      return 'PNG Square'
    case 'png-email':
      return 'PNG Email'
    case 'png-print':
      return 'PNG Print'
    case 'pdf':
      return 'PDF'
    case 'zip':
      return 'ZIP Marketing Pack'
    default:
      return format
  }
}

function percentage(numerator: number, denominator: number): string {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

function conversionRateValue(item: ExhibitorSummary): number {
  if (!item.generatorOpenedCount) return 0
  return Math.round((item.exportSucceededCount / item.generatorOpenedCount) * 100)
}

function buildReportsHref(args: {
  range?: string
  exhibitorId?: string | null
  q?: string | null
  startDate?: string | null
  endDate?: string | null
}) {
  const params = new URLSearchParams()

  const startDate = args.startDate?.trim()
  const endDate = args.endDate?.trim()

  if (startDate) {
    params.set('startDate', startDate)
  }

  if (endDate) {
    params.set('endDate', endDate)
  }

  if (!startDate && !endDate && args.range && args.range !== 'all') {
    params.set('range', args.range)
  }

  if (args.exhibitorId) {
    params.set('exhibitorId', args.exhibitorId)
  }

  const searchQuery = args.q?.trim()
  if (searchQuery) {
    params.set('q', searchQuery)
  }

  const query = params.toString()
  return query ? `/reports?${query}` : '/reports'
}

function buildExhibitorDetailHref(
  exhibitorId: string,
  args?: {
    range?: string
    startDate?: string | null
    endDate?: string | null
  }
) {
  const params = new URLSearchParams()

  const startDate = args?.startDate?.trim()
  const endDate = args?.endDate?.trim()

  if (startDate) {
    params.set('startDate', startDate)
  }

  if (endDate) {
    params.set('endDate', endDate)
  }

  if (!startDate && !endDate && args?.range && args.range !== 'all') {
    params.set('range', args.range)
  }

  const query = params.toString()
  return query
    ? `/reports/exhibitors/${encodeURIComponent(exhibitorId)}?${query}`
    : `/reports/exhibitors/${encodeURIComponent(exhibitorId)}`
}

function getCsvHref(
  range?: string,
  exhibitorId?: string | null,
  q?: string | null,
  startDate?: string | null,
  endDate?: string | null
): string {
  const params = new URLSearchParams()

  const normalizedStartDate = startDate?.trim()
  const normalizedEndDate = endDate?.trim()

  if (normalizedStartDate) {
    params.set('startDate', normalizedStartDate)
  }

  if (normalizedEndDate) {
    params.set('endDate', normalizedEndDate)
  }

  if (!normalizedStartDate && !normalizedEndDate && range && range !== 'all') {
    params.set('range', range)
  }

  if (exhibitorId) {
    params.set('exhibitorId', exhibitorId)
  }

  const searchQuery = q?.trim()
  if (searchQuery) {
    params.set('q', searchQuery)
  }

  const query = params.toString()
  return query ? `/api/reports/csv?${query}` : '/api/reports/csv'
}

function getXlsxHref(
  range?: string,
  exhibitorId?: string | null,
  q?: string | null,
  startDate?: string | null,
  endDate?: string | null
): string {
  const params = new URLSearchParams()

  const normalizedStartDate = startDate?.trim()
  const normalizedEndDate = endDate?.trim()

  if (normalizedStartDate) {
    params.set('startDate', normalizedStartDate)
  }

  if (normalizedEndDate) {
    params.set('endDate', normalizedEndDate)
  }

  if (!normalizedStartDate && !normalizedEndDate && range && range !== 'all') {
    params.set('range', range)
  }

  if (exhibitorId) {
    params.set('exhibitorId', exhibitorId)
  }

  const searchQuery = q?.trim()
  if (searchQuery) {
    params.set('q', searchQuery)
  }

  const query = params.toString()
  return query ? `/api/reports/xlsx?${query}` : '/api/reports/xlsx'
}

function compareValues(
  a: ExhibitorSummary,
  b: ExhibitorSummary,
  sortKey: SortKey,
  sortDirection: SortDirection
): number {
  let result = 0

  switch (sortKey) {
    case 'companyName':
      result = a.companyName.localeCompare(b.companyName)
      break
    case 'exhibitorId':
      result = a.exhibitorId.localeCompare(b.exhibitorId)
      break
    case 'totalEvents':
      result = a.totalEvents - b.totalEvents
      break
    case 'generatorOpenedCount':
      result = a.generatorOpenedCount - b.generatorOpenedCount
      break
    case 'exportSucceededCount':
      result = a.exportSucceededCount - b.exportSucceededCount
      break
    case 'exportFailedCount':
      result = a.exportFailedCount - b.exportFailedCount
      break
    case 'conversionRate':
      result = conversionRateValue(a) - conversionRateValue(b)
      break
    case 'lastActivityAt': {
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      result = aTime - bTime
      break
    }
  }

  return sortDirection === 'asc' ? result : -result
}

function getConversionRate(opens: number, exports: number) {
  if (!opens) return 0
  return exports / opens
}

function buildLeaderboard(rows: ExhibitorSummary[]) {
  return [...rows]
    .map((row) => ({
      ...row,
      conversion: getConversionRate(
        row.generatorOpenedCount,
        row.exportSucceededCount
      ),
    }))
    .sort((a, b) => {
      if (b.conversion !== a.conversion) {
        return b.conversion - a.conversion
      }

      if (b.exportSucceededCount !== a.exportSucceededCount) {
        return b.exportSucceededCount - a.exportSucceededCount
      }

      return a.companyName.localeCompare(b.companyName)
    })
}

function buildNeedsAttention(rows: ExhibitorSummary[]) {
  return rows.filter((row) => {
    const opens = row.generatorOpenedCount
    const exports = row.exportSucceededCount

    return (
      (opens > 0 && exports === 0) ||
      (row.linkGeneratedCount > 0 && exports === 0)
    )
  })
}

function buildConversionBuckets(rows: ExhibitorSummary[]) {
  const buckets = {
    zero: 0,
    low: 0,
    medium: 0,
    high: 0,
  }

  for (const row of rows) {
    const rate = getConversionRate(
      row.generatorOpenedCount,
      row.exportSucceededCount
    )

    if (rate === 0) buckets.zero++
    else if (rate <= 0.25) buckets.low++
    else if (rate <= 0.5) buckets.medium++
    else buckets.high++
  }

  return buckets
}

function getLastActiveStatus(value: string | null): {
  label: string
  className: string
} {
  if (!value) {
    return {
      label: 'No activity',
      className: 'bg-neutral-100 text-neutral-600',
    }
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return {
      label: 'Unknown',
      className: 'bg-neutral-100 text-neutral-600',
    }
  }

  const now = Date.now()
  const diffMs = now - timestamp
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay

  if (diffMs <= oneDay) {
    return {
      label: 'Active today',
      className: 'bg-emerald-100 text-emerald-700',
    }
  }

  if (diffMs <= sevenDays) {
    return {
      label: 'Active this week',
      className: 'bg-blue-100 text-blue-700',
    }
  }

  return {
    label: 'Inactive',
    className: 'bg-amber-100 text-amber-700',
  }
}

function ChartCard({
  title,
  description,
  emptyMessage,
  hasData,
  chartsReady,
  children,
}: {
  title: string
  description: string
  emptyMessage: string
  hasData: boolean
  chartsReady: boolean
  children: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>

      <div className="mt-6 h-[360px] min-w-0">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            {emptyMessage}
          </div>
        ) : !chartsReady ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Loading chart…
          </div>
        ) : (
          <div className="h-full min-w-0">{children}</div>
        )}
      </div>
    </div>
  )
}

export default function ReportsClient({
  summary,
  currentRange,
  currentExhibitorId,
  currentSearchQuery,
}: Props) {
  const [search, setSearch] = useState(currentSearchQuery)
  const [chartsReady, setChartsReady] = useState(false)
  const [exhibitorPickerValue, setExhibitorPickerValue] = useState(
    summary.appliedExhibitorId
      ? `${summary.appliedExhibitorName ?? summary.appliedExhibitorId} (${summary.appliedExhibitorId})`
      : ''
  )

  const [sortKey, setSortKey] = useState<SortKey>('totalEvents')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [pageSize, setPageSize] = useState<number>(25)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('all')

  useEffect(() => {
    setChartsReady(true)
  }, [])

  const topExhibitorsChartData = useMemo(() => {
    return summary.exhibitorSummaries.slice(0, 10).map((item) => ({
      name:
        item.companyName.length > 18
          ? `${item.companyName.slice(0, 18)}…`
          : item.companyName,
      totalEvents: item.totalEvents,
      opens: item.generatorOpenedCount,
      exports: item.exportSucceededCount,
    }))
  }, [summary.exhibitorSummaries])

  const formatUsageChartData = useMemo(() => {
    return Object.entries(summary.formatUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([format, count]) => ({
        format: formatFormatLabel(format),
        count,
      }))
  }, [summary.formatUsage])

  const dailyChartData = useMemo(() => {
    return summary.dailySeries.map((item) => ({
      ...item,
      label: formatShortDate(item.date),
    }))
  }, [summary.dailySeries])

  const funnelRows = useMemo(() => {
    return summary.funnel.steps.map((step) => ({
      key: step.key,
      label: step.label,
      count: step.count,
      rateFromPrevious: step.rateFromPrevious,
      rateFromStart: step.rateFromStart,
    }))
  }, [summary.funnel.steps])

  const noExportExhibitors = summary.exhibitorSummaries.filter(
    (item) => item.generatedLinkButNeverExported
  )

  const failingExhibitors = summary.exhibitorSummaries.filter(
    (item) => item.exportFailedCount > 0
  )

  const filteredAvailableExhibitors = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) {
      return summary.availableExhibitors
    }

    return summary.availableExhibitors.filter((item) => {
      return (
        item.companyName.toLowerCase().includes(q) ||
        item.exhibitorId.toLowerCase().includes(q)
      )
    })
  }, [search, summary.availableExhibitors])

  const exhibitorOptions = useMemo(() => {
    return summary.availableExhibitors.map((item) => ({
      ...item,
      label: `${item.companyName} (${item.exhibitorId})`,
    }))
  }, [summary.availableExhibitors])

  const leaderboard = useMemo(() => {
    return buildLeaderboard(summary.exhibitorSummaries)
  }, [summary.exhibitorSummaries])

  const needsAttention = useMemo(() => {
    return buildNeedsAttention(summary.exhibitorSummaries)
  }, [summary.exhibitorSummaries])

  const conversionBuckets = useMemo(() => {
    return buildConversionBuckets(summary.exhibitorSummaries)
  }, [summary.exhibitorSummaries])

  const topPerformer = leaderboard[0] ?? null
  const zeroConversionCount = conversionBuckets.zero

  const focusedExhibitorRows = useMemo(() => {
    switch (focusFilter) {
      case 'needsAttention':
        return summary.exhibitorSummaries.filter((item) => {
          const opens = item.generatorOpenedCount
          const exports = item.exportSucceededCount
          return (
            (opens > 0 && exports === 0) ||
            (item.linkGeneratedCount > 0 && exports === 0)
          )
        })
      case 'zeroConversion':
        return summary.exhibitorSummaries.filter(
          (item) => conversionRateValue(item) === 0
        )
      case 'failedExports':
        return summary.exhibitorSummaries.filter(
          (item) => item.exportFailedCount > 0
        )
      case 'topPerformers':
        return leaderboard.slice(0, 10)
      case 'all':
      default:
        return summary.exhibitorSummaries
    }
  }, [focusFilter, summary.exhibitorSummaries, leaderboard])

  const sortedExhibitorRows = useMemo(() => {
    const copy = [...focusedExhibitorRows]
    copy.sort((a, b) => compareValues(a, b, sortKey, sortDirection))
    return copy
  }, [focusedExhibitorRows, sortKey, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [focusFilter, pageSize])

  const totalPages = Math.max(1, Math.ceil(sortedExhibitorRows.length / pageSize))

  const paginatedExhibitorRows = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const startIndex = (safePage - 1) * pageSize
    return sortedExhibitorRows.slice(startIndex, startIndex + pageSize)
  }, [sortedExhibitorRows, currentPage, totalPages, pageSize])

  const tableStartIndex =
    sortedExhibitorRows.length === 0
      ? 0
      : (Math.min(currentPage, totalPages) - 1) * pageSize + 1

  const tableEndIndex = Math.min(
    Math.min(currentPage, totalPages) * pageSize,
    sortedExhibitorRows.length
  )

  function handleApplyExhibitorFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = exhibitorPickerValue.trim().toLowerCase()

    if (!normalized) {
      window.location.href = buildReportsHref({
        range: currentRange,
        q: currentSearchQuery,
        startDate: summary.appliedStartDate,
        endDate: summary.appliedEndDate,
      })
      return
    }

    const matchedExhibitor = exhibitorOptions.find((item) => {
      return (
        item.label.toLowerCase() === normalized ||
        item.exhibitorId.toLowerCase() === normalized ||
        item.companyName.toLowerCase() === normalized
      )
    })

    if (!matchedExhibitor) {
      return
    }

    window.location.href = buildReportsHref({
      range: currentRange,
      exhibitorId: matchedExhibitor.exhibitorId,
      q: currentSearchQuery,
      startDate: summary.appliedStartDate,
      endDate: summary.appliedEndDate,
    })
  }

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(nextKey)
      setSortDirection(
        nextKey === 'companyName' || nextKey === 'exhibitorId' ? 'asc' : 'desc'
      )
    }
    setCurrentPage(1)
  }

  function sortIndicator(column: SortKey) {
    if (sortKey !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  function activateFocusFilter(nextFilter: FocusFilter) {
    setFocusFilter(nextFilter)

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const tableSection = document.getElementById('usage-by-exhibitor')
        tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  function focusButtonClasses(filter: FocusFilter) {
    const isActive = focusFilter === filter

    return `rounded-full border px-3 py-2 text-xs font-medium transition ${
      isActive
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
    }`
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Reporting by exhibitor for generator usage and exports.
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Showing:{' '}
              <span className="font-medium">
                {summary.appliedStartDate || summary.appliedEndDate
                  ? 'Custom date range'
                  : RANGE_OPTIONS.find((item) => item.value === currentRange)?.label ??
                    'All time'}
              </span>
              {summary.appliedStartDate || summary.appliedEndDate ? (
                <>
                  {' '}
                  · Dates:{' '}
                  <span className="font-medium">
                    {summary.appliedStartDate ?? 'Open'} →{' '}
                    {summary.appliedEndDate ?? 'Open'}
                  </span>
                </>
              ) : null}
              {summary.appliedSearchQuery ? (
                <>
                  {' '}
                  · Search:{' '}
                  <span className="font-medium">“{summary.appliedSearchQuery}”</span>
                </>
              ) : null}
              {summary.appliedExhibitorName ? (
                <>
                  {' '}
                  · Exhibitor:{' '}
                  <span className="font-medium">
                    {summary.appliedExhibitorName} ({summary.appliedExhibitorId})
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => {
              const isActive =
                !summary.appliedStartDate &&
                !summary.appliedEndDate &&
                option.value === currentRange

              return (
                <Link
                  key={option.value}
                  href={buildReportsHref({
                    range: option.value,
                    exhibitorId: currentExhibitorId,
                    q: currentSearchQuery,
                  })}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {option.label}
                </Link>
              )
            })}

            <a
              href={getCsvHref(
                currentRange,
                currentExhibitorId,
                currentSearchQuery,
                summary.appliedStartDate,
                summary.appliedEndDate
              )}
              className="rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Download CSV
            </a>

            <a
              href={getXlsxHref(
                currentRange,
                currentExhibitorId,
                currentSearchQuery,
                summary.appliedStartDate,
                summary.appliedEndDate
              )}
              className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Download XLSX
            </a>
          </div>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Filter by exhibitor</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Search server-side by company name or exhibitor ID, then optionally jump directly to one exhibitor.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(summary.appliedSearchQuery ||
                summary.appliedExhibitorId ||
                summary.appliedStartDate ||
                summary.appliedEndDate) ? (
                <Link
                  href="/reports"
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Clear all filters
                </Link>
              ) : null}

              {summary.appliedExhibitorId ? (
                <Link
                  href={buildReportsHref({
                    range: currentRange,
                    q: currentSearchQuery,
                    startDate: summary.appliedStartDate,
                    endDate: summary.appliedEndDate,
                  })}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Clear exhibitor filter
                </Link>
              ) : null}
            </div>
          </div>

          <form
            method="get"
            action="/reports"
            className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end"
          >
            <div>
              <label htmlFor="report-search" className="mb-2 block text-sm font-medium text-neutral-700">
                Search exhibitors
              </label>
              <input
                id="report-search"
                name="q"
                type="text"
                placeholder="Search exhibitors by company name or ID"
                defaultValue={currentSearchQuery}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-neutral-700">
                Start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={summary.appliedStartDate ?? ''}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-neutral-700">
                End date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={summary.appliedEndDate ?? ''}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div className="flex gap-2">
              <input type="hidden" name="range" value={currentRange} />
              {currentExhibitorId ? (
                <input type="hidden" name="exhibitorId" value={currentExhibitorId} />
              ) : null}
              <button
                type="submit"
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Apply filters
              </button>
            </div>
          </form>

          <form
            onSubmit={handleApplyExhibitorFilter}
            className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <label htmlFor="exhibitor-picker" className="mb-2 block text-sm font-medium text-neutral-700">
                  Select one exhibitor
                </label>
                <input
                  id="exhibitor-picker"
                  list="exhibitor-picker-options"
                  type="text"
                  value={exhibitorPickerValue}
                  onChange={(event) => setExhibitorPickerValue(event.target.value)}
                  placeholder="Start typing company name or exhibitor ID"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                />
                <datalist id="exhibitor-picker-options">
                  {exhibitorOptions.map((item) => (
                    <option key={item.exhibitorId} value={item.label} />
                  ))}
                </datalist>
                <p className="mt-2 text-xs text-neutral-500">
                  Type a company name or ID, then choose the matching exhibitor.
                </p>
              </div>

              <button
                type="submit"
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Apply exhibitor
              </button>
            </div>
          </form>

          <div className="mt-5">
            <label htmlFor="visible-exhibitor-filter" className="mb-2 block text-sm font-medium text-neutral-700">
              Filter visible exhibitor list
            </label>
            <input
              id="visible-exhibitor-filter"
              type="text"
              placeholder="Filter the exhibitor list below"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full max-w-md rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200">
            <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700">
              Available exhibitors ({filteredAvailableExhibitors.length})
            </div>

            <div className="max-h-72 overflow-auto">
              {filteredAvailableExhibitors.length === 0 ? (
                <div className="px-4 py-4 text-sm text-neutral-500">
                  No exhibitors match your current search.
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {filteredAvailableExhibitors.map((item) => {
                    const isActive = item.exhibitorId === summary.appliedExhibitorId

                    return (
                      <div
                        key={item.exhibitorId}
                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="font-medium text-neutral-900">{item.companyName}</div>
                          <div className="text-sm text-neutral-500">
                            Exhibitor ID: {item.exhibitorId}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={buildReportsHref({
                              range: currentRange,
                              exhibitorId: item.exhibitorId,
                              q: currentSearchQuery,
                              startDate: summary.appliedStartDate,
                              endDate: summary.appliedEndDate,
                            })}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                              isActive
                                ? 'border-neutral-900 bg-neutral-900 text-white'
                                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            {isActive ? 'Selected' : 'Filter reports'}
                          </Link>

                          <Link
                            href={buildExhibitorDetailHref(item.exhibitorId, {
                              range: currentRange,
                              startDate: summary.appliedStartDate,
                              endDate: summary.appliedEndDate,
                            })}
                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">Total Events</div>
            <div className="mt-2 text-3xl font-semibold">{summary.totalEvents}</div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">Exhibitors Seen</div>
            <div className="mt-2 text-3xl font-semibold">{summary.totalExhibitors}</div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">Generator Opens</div>
            <div className="mt-2 text-3xl font-semibold">{summary.totalGeneratorOpens}</div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">Exports Succeeded</div>
            <div className="mt-2 text-3xl font-semibold">{summary.totalExportsSucceeded}</div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">Exports Failed</div>
            <div className="mt-2 text-3xl font-semibold">{summary.totalExportsFailed}</div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">Open → Export</div>
            <div className="mt-2 text-3xl font-semibold">{summary.conversionRate}</div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => activateFocusFilter('needsAttention')}
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-left shadow-sm transition hover:bg-red-100"
          >
            <div className="text-sm font-medium text-red-700">Needs attention</div>
            <div className="mt-2 text-3xl font-semibold text-red-900">{needsAttention.length}</div>
            <p className="mt-2 text-sm text-red-700">
              Exhibitors with engagement but no successful exports.
            </p>
          </button>

          <button
            type="button"
            onClick={() => activateFocusFilter('topPerformers')}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left shadow-sm transition hover:bg-emerald-100"
          >
            <div className="text-sm font-medium text-emerald-700">Top conversion</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-900">
              {topPerformer
                ? `${Math.round(
                    getConversionRate(
                      topPerformer.generatorOpenedCount,
                      topPerformer.exportSucceededCount
                    ) * 100
                  )}%`
                : '0%'}
            </div>
            <p className="mt-2 text-sm text-emerald-700">
              {topPerformer ? topPerformer.companyName : 'No exhibitor data yet.'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => activateFocusFilter('zeroConversion')}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm transition hover:bg-amber-100"
          >
            <div className="text-sm font-medium text-amber-700">Zero-conversion exhibitors</div>
            <div className="mt-2 text-3xl font-semibold text-amber-900">{zeroConversionCount}</div>
            <p className="mt-2 text-sm text-amber-700">
              Exhibitors currently sitting at 0% conversion.
            </p>
          </button>

          <button
            type="button"
            onClick={() => activateFocusFilter('failedExports')}
            className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left shadow-sm transition hover:bg-blue-100"
          >
            <div className="text-sm font-medium text-blue-700">Failed exports</div>
            <div className="mt-2 text-3xl font-semibold text-blue-900">{summary.totalExportsFailed}</div>
            <p className="mt-2 text-sm text-blue-700">
              Total failed export events in the selected view.
            </p>
          </button>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">🏆 Top performers</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Ranked by open-to-export conversion rate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => activateFocusFilter('topPerformers')}
                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                Focus table
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-neutral-500">No exhibitor data available yet.</p>
              ) : (
                leaderboard.slice(0, 5).map((item, index) => {
                  const rate = getConversionRate(
                    item.generatorOpenedCount,
                    item.exportSucceededCount
                  )

                  return (
                    <Link
                      key={item.exhibitorId}
                      href={buildExhibitorDetailHref(item.exhibitorId, {
                        range: currentRange,
                        startDate: summary.appliedStartDate,
                        endDate: summary.appliedEndDate,
                      })}
                      className="block rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition hover:bg-neutral-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-neutral-900 px-2 py-1 text-xs font-semibold text-white">
                              #{index + 1}
                            </span>
                            <span className="font-medium text-neutral-900">{item.companyName}</span>
                          </div>
                          <div className="mt-2 text-xs text-neutral-500">
                            Opens: {item.generatorOpenedCount} · Successful exports:{' '}
                            {item.exportSucceededCount}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-neutral-900">
                            {(rate * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-neutral-500">conversion</div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">⚠️ Needs attention</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Exhibitors engaging but not converting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => activateFocusFilter('needsAttention')}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
              >
                Focus table
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {needsAttention.length === 0 ? (
                <p className="text-sm text-neutral-500">No issues detected.</p>
              ) : (
                needsAttention.slice(0, 8).map((item) => {
                  const openedNoExport =
                    item.generatorOpenedCount > 0 &&
                    item.exportSucceededCount === 0

                  return (
                    <Link
                      key={item.exhibitorId}
                      href={buildExhibitorDetailHref(item.exhibitorId, {
                        range: currentRange,
                        startDate: summary.appliedStartDate,
                        endDate: summary.appliedEndDate,
                      })}
                      className="block rounded-xl border border-red-100 bg-red-50 p-4 transition hover:bg-red-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-red-900">{item.companyName}</div>
                          <div className="mt-1 text-xs text-red-700">
                            {openedNoExport
                              ? 'Opened generator but never completed an export'
                              : 'Generated a link but no successful exports recorded'}
                          </div>
                          <div className="mt-2 text-xs text-red-600">
                            Links: {item.linkGeneratedCount} · Opens:{' '}
                            {item.generatorOpenedCount} · Exports:{' '}
                            {item.exportSucceededCount}
                          </div>
                        </div>

                        <div className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-red-700">
                          Review
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">📊 Conversion distribution</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  How exhibitors are spread by conversion performance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => activateFocusFilter('zeroConversion')}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
              >
                Focus 0%
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { label: '0%', value: conversionBuckets.zero, tone: 'bg-neutral-400' },
                { label: '1–25%', value: conversionBuckets.low, tone: 'bg-neutral-500' },
                { label: '25–50%', value: conversionBuckets.medium, tone: 'bg-neutral-700' },
                { label: '50%+', value: conversionBuckets.high, tone: 'bg-emerald-500' },
              ].map((bucket) => (
                <div key={bucket.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-neutral-600">{bucket.label}</span>
                    <span className="font-medium text-neutral-900">{bucket.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100">
                    <div
                      className={`h-2 rounded-full ${bucket.tone}`}
                      style={{
                        width: `${
                          summary.exhibitorSummaries.length
                            ? (bucket.value / summary.exhibitorSummaries.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Funnel analytics"
            description="Step-by-step progression through the generator journey."
            emptyMessage="No funnel activity recorded yet."
            hasData={!funnelRows.every((item) => item.count === 0)}
            chartsReady={chartsReady}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={funnelRows}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 32, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={130} />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Funnel step breakdown</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Conversion from the previous step in the journey.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 pr-4 font-medium">Step</th>
                    <th className="py-3 pr-4 font-medium">Count</th>
                    <th className="py-3 pr-4 font-medium">From previous</th>
                    <th className="py-3 pr-4 font-medium">From start</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelRows.map((item) => (
                    <tr key={item.key} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium">{item.label}</td>
                      <td className="py-3 pr-4">{item.count}</td>
                      <td className="py-3 pr-4">{item.rateFromPrevious}</td>
                      <td className="py-3 pr-4">{item.rateFromStart}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Top exhibitors by activity"
            description="Compare total events, opens, exports, and failures."
            emptyMessage="No exhibitor activity to chart."
            hasData={topExhibitorsChartData.length > 0}
            chartsReady={chartsReady}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={topExhibitorsChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalEvents" name="Total events" isAnimationActive={false} />
                  <Bar dataKey="opens" name="Generator opens" isAnimationActive={false} />
                  <Bar dataKey="exports" name="Exports succeeded" isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>

          <ChartCard
            title="Export format usage"
            description="Which output formats are being used most."
            emptyMessage="No export data to chart."
            hasData={formatUsageChartData.length > 0}
            chartsReady={chartsReady}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={formatUsageChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="format"
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Generator opens over time"
            description="Daily generator opens and export trends."
            emptyMessage="Select a date range to view daily charts."
            hasData={dailyChartData.length > 0}
            chartsReady={chartsReady}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <LineChart
                  width={width}
                  height={height}
                  data={dailyChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="generatorOpened"
                    name="Generator opens"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="exportsSucceeded"
                    name="Exports succeeded"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </MeasuredChart>
          </ChartCard>

          <ChartCard
            title="Export failures over time"
            description="Track failed exports by day in the selected range."
            emptyMessage="Select a date range to view daily charts."
            hasData={dailyChartData.length > 0}
            chartsReady={chartsReady}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <LineChart
                  width={width}
                  height={height}
                  data={dailyChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="exportsFailed"
                    name="Exports failed"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </MeasuredChart>
          </ChartCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Generated links but never exported</h2>
            <div className="mt-4 space-y-3">
              {noExportExhibitors.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No exhibitors currently match this condition.
                </p>
              ) : (
                noExportExhibitors.map((item) => (
                  <div key={item.exhibitorId} className="rounded-xl border bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{item.companyName}</div>
                        <div className="text-sm text-neutral-600">
                          Exhibitor ID: {item.exhibitorId}
                        </div>
                        <div className="mt-2 text-sm text-neutral-700">
                          Links generated: {item.linkGeneratedCount}
                        </div>
                      </div>

                      <Link
                        href={buildExhibitorDetailHref(item.exhibitorId, {
                          range: currentRange,
                          startDate: summary.appliedStartDate,
                          endDate: summary.appliedEndDate,
                        })}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Exhibitors with export failures</h2>
            <div className="mt-4 space-y-3">
              {failingExhibitors.length === 0 ? (
                <p className="text-sm text-neutral-500">No export failures recorded yet.</p>
              ) : (
                failingExhibitors.map((item) => (
                  <div key={item.exhibitorId} className="rounded-xl border bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{item.companyName}</div>
                        <div className="text-sm text-neutral-600">
                          Exhibitor ID: {item.exhibitorId}
                        </div>
                        <div className="mt-2 text-sm text-neutral-700">
                          Failed exports: {item.exportFailedCount}
                        </div>
                      </div>

                      <Link
                        href={buildExhibitorDetailHref(item.exhibitorId, {
                          range: currentRange,
                          startDate: summary.appliedStartDate,
                          endDate: summary.appliedEndDate,
                        })}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section
          id="usage-by-exhibitor"
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Usage by exhibitor</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Sort the table, page through datasets, and focus on key segments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="pageSize" className="mb-2 block text-sm font-medium text-neutral-700">
                  Rows per page
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setCurrentPage(1)
                  }}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-neutral-500">
                Showing {tableStartIndex}-{tableEndIndex} of {sortedExhibitorRows.length}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => activateFocusFilter('all')} className={focusButtonClasses('all')}>
              All exhibitors
            </button>
            <button
              type="button"
              onClick={() => activateFocusFilter('needsAttention')}
              className={focusButtonClasses('needsAttention')}
            >
              Needs attention
            </button>
            <button
              type="button"
              onClick={() => activateFocusFilter('zeroConversion')}
              className={focusButtonClasses('zeroConversion')}
            >
              Zero conversion
            </button>
            <button
              type="button"
              onClick={() => activateFocusFilter('failedExports')}
              className={focusButtonClasses('failedExports')}
            >
              Failed exports
            </button>
            <button
              type="button"
              onClick={() => activateFocusFilter('topPerformers')}
              className={focusButtonClasses('topPerformers')}
            >
              Top performers
            </button>
          </div>

          <div className="mt-3 text-sm text-neutral-500">
            Current table focus:{' '}
            <span className="font-medium text-neutral-900">
              {focusFilter === 'all'
                ? 'All exhibitors'
                : focusFilter === 'needsAttention'
                ? 'Needs attention'
                : focusFilter === 'zeroConversion'
                ? 'Zero conversion'
                : focusFilter === 'failedExports'
                ? 'Failed exports'
                : 'Top performers'}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('companyName')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Company{sortIndicator('companyName')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('exhibitorId')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Exhibitor ID{sortIndicator('exhibitorId')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('totalEvents')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Total Events{sortIndicator('totalEvents')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('generatorOpenedCount')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Generator Opened{sortIndicator('generatorOpenedCount')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('exportSucceededCount')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Exports Succeeded{sortIndicator('exportSucceededCount')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('exportFailedCount')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Exports Failed{sortIndicator('exportFailedCount')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('conversionRate')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Open → Export{sortIndicator('conversionRate')}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('lastActivityAt')}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      Last Activity{sortIndicator('lastActivityAt')}
                    </button>
                  </th>
                  <th className="py-3 pr-0 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExhibitorRows.length === 0 ? (
                  <tr>
                    <td className="py-4 text-neutral-500" colSpan={9}>
                      No exhibitors match your current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedExhibitorRows.map((item) => {
                    const status = getLastActiveStatus(item.lastActivityAt)

                    return (
                      <tr key={item.exhibitorId} className="border-b align-top last:border-b-0">
                        <td className="py-3 pr-4 font-medium">
                          <Link
                            href={buildExhibitorDetailHref(item.exhibitorId, {
                              range: currentRange,
                              startDate: summary.appliedStartDate,
                              endDate: summary.appliedEndDate,
                            })}
                            className="text-neutral-900 underline-offset-4 hover:underline"
                          >
                            {item.companyName}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">{item.exhibitorId}</td>
                        <td className="py-3 pr-4">{item.totalEvents}</td>
                        <td className="py-3 pr-4">{item.generatorOpenedCount}</td>
                        <td className="py-3 pr-4">{item.exportSucceededCount}</td>
                        <td className="py-3 pr-4">{item.exportFailedCount}</td>
                        <td className="py-3 pr-4">
                          {percentage(item.exportSucceededCount, item.generatorOpenedCount)}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="space-y-2">
                            <div>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500">
                              {formatDate(item.lastActivityAt)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-0">
                          <Link
                            href={buildExhibitorDetailHref(item.exhibitorId, {
                              range: currentRange,
                              startDate: summary.appliedStartDate,
                              endDate: summary.appliedEndDate,
                            })}
                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                          >
                            View details
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {sortedExhibitorRows.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-500">
                Page {Math.min(currentPage, totalPages)} of {totalPages}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recent events</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 pr-4 font-medium">Timestamp</th>
                  <th className="py-3 pr-4 font-medium">Company</th>
                  <th className="py-3 pr-4 font-medium">Exhibitor ID</th>
                  <th className="py-3 pr-4 font-medium">Event</th>
                  <th className="py-3 pr-4 font-medium">Format</th>
                  <th className="py-3 pr-4 font-medium">Environment</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentEvents.length === 0 ? (
                  <tr>
                    <td className="py-4 text-neutral-500" colSpan={6}>
                      No events recorded yet.
                    </td>
                  </tr>
                ) : (
                  summary.recentEvents.map((event) => (
                    <tr key={event.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4">{formatDate(event.timestamp)}</td>
                      <td className="py-3 pr-4">
                        <Link
                          href={buildExhibitorDetailHref(event.exhibitorId, {
                            range: currentRange,
                            startDate: summary.appliedStartDate,
                            endDate: summary.appliedEndDate,
                          })}
                          className="text-neutral-900 underline-offset-4 hover:underline"
                        >
                          {event.companyName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{event.exhibitorId}</td>
                      <td className="py-3 pr-4">{event.eventType}</td>
                      <td className="py-3 pr-4">
                        {event.format ? formatFormatLabel(event.format) : '—'}
                      </td>
                      <td className="py-3 pr-4">{event.environment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}