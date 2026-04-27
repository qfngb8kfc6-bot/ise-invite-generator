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
  | 'activeOnly'

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
] as const

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250] as const

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
      className: 'bg-neutral-800 text-neutral-300',
    }
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return {
      label: 'Unknown',
      className: 'bg-neutral-800 text-neutral-300',
    }
  }

  const now = Date.now()
  const diffMs = now - timestamp
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay

  if (diffMs <= oneDay) {
    return {
      label: 'Active today',
      className: 'bg-emerald-500/15 text-emerald-300',
    }
  }

  if (diffMs <= sevenDays) {
    return {
      label: 'Active this week',
      className: 'bg-blue-500/15 text-blue-300',
    }
  }

  return {
    label: 'Inactive',
    className: 'bg-amber-500/15 text-amber-300',
  }
}

function Card({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div
      id={id}
      className={`rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  )
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
    <Card className="min-w-0 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-neutral-400">{description}</p>

      <div className="mt-5 h-[280px] min-w-0">
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
    </Card>
  )
}

function KpiCard({
  label,
  value,
  sublabel,
  tone = 'default',
}: {
  label: string
  value: string | number
  sublabel: string
  tone?: 'default' | 'green' | 'blue' | 'amber' | 'red'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-500/20 bg-emerald-500/8'
      : tone === 'blue'
      ? 'border-blue-500/20 bg-blue-500/8'
      : tone === 'amber'
      ? 'border-amber-500/20 bg-amber-500/8'
      : tone === 'red'
      ? 'border-red-500/20 bg-red-500/8'
      : 'border-white/10 bg-white/[0.03]'

  return (
    <div className={`rounded-3xl border px-5 py-4 ${toneClasses}`}>
      <div className="text-sm font-medium text-neutral-300">{label}</div>
      <div className="mt-3 text-4xl font-semibold leading-none text-white">
        {value}
      </div>
      <div className="mt-2 text-xs text-neutral-500">{sublabel}</div>
    </div>
  )
}

function CompactFocusCard({
  title,
  subtitle,
  value,
  onClick,
  tone,
}: {
  title: string
  subtitle: string
  value: string
  onClick: () => void
  tone: 'red' | 'green' | 'amber' | 'blue'
}) {
  const toneClasses =
    tone === 'red'
      ? 'border-red-500/20 bg-red-500/8 hover:bg-red-500/12'
      : tone === 'green'
      ? 'border-emerald-500/20 bg-emerald-500/8 hover:bg-emerald-500/12'
      : tone === 'amber'
      ? 'border-amber-500/20 bg-amber-500/8 hover:bg-amber-500/12'
      : 'border-blue-500/20 bg-blue-500/8 hover:bg-blue-500/12'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border px-5 py-4 text-left transition ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-neutral-200">{title}</div>
          <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
        </div>
        <div className="text-3xl font-semibold leading-none text-white">
          {value}
        </div>
      </div>
    </button>
  )
}

function ToolbarPill({
  active,
  children,
  href,
}: {
  active: boolean
  children: ReactNode
  href: string
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  )
}

function FocusChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
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
  const [pageSize, setPageSize] = useState<number>(50)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('all')
  const [needsAttentionExpanded, setNeedsAttentionExpanded] = useState(false)

  useEffect(() => {
    setChartsReady(true)
  }, [])

  const topExhibitorsChartData = useMemo(() => {
    return summary.exhibitorSummaries.slice(0, 12).map((item) => ({
      name:
        item.companyName.length > 16
          ? `${item.companyName.slice(0, 16)}…`
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

  const searchedExhibitorRows = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) {
      return summary.exhibitorSummaries
    }

    return summary.exhibitorSummaries.filter((item) => {
      return (
        item.companyName.toLowerCase().includes(q) ||
        item.exhibitorId.toLowerCase().includes(q)
      )
    })
  }, [search, summary.exhibitorSummaries])

  const focusedExhibitorRows = useMemo(() => {
    switch (focusFilter) {
      case 'needsAttention':
        return searchedExhibitorRows.filter((item) => {
          const opens = item.generatorOpenedCount
          const exports = item.exportSucceededCount
          return (
            (opens > 0 && exports === 0) ||
            (item.linkGeneratedCount > 0 && exports === 0)
          )
        })
      case 'zeroConversion':
        return searchedExhibitorRows.filter(
          (item) => conversionRateValue(item) === 0
        )
      case 'failedExports':
        return searchedExhibitorRows.filter((item) => item.exportFailedCount > 0)
      case 'topPerformers':
        return buildLeaderboard(searchedExhibitorRows).slice(0, 50)
      case 'activeOnly':
        return searchedExhibitorRows.filter((item) => item.totalEvents > 0)
      case 'all':
      default:
        return searchedExhibitorRows
    }
  }, [focusFilter, searchedExhibitorRows])

  const sortedExhibitorRows = useMemo(() => {
    const copy = [...focusedExhibitorRows]
    copy.sort((a, b) => compareValues(a, b, sortKey, sortDirection))
    return copy
  }, [focusedExhibitorRows, sortKey, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [focusFilter, pageSize, search])

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

  const visibleNeedsAttentionRows = needsAttentionExpanded
    ? needsAttention
    : needsAttention.slice(0, 5)

  function handleApplyExhibitorFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = exhibitorPickerValue.trim().toLowerCase()

    if (!normalized) {
      window.location.href = buildReportsHref({
        range: currentRange,
        q: search,
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
      q: search,
      startDate: summary.appliedStartDate,
      endDate: summary.appliedEndDate,
    })
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    window.location.href = buildReportsHref({
      range: currentRange,
      exhibitorId: currentExhibitorId,
      q: search,
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
        const tableSection = document.getElementById('exhibitor-explorer')
        tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Reports
              </h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
                <span>
                  Range:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedStartDate || summary.appliedEndDate
                      ? 'Custom date range'
                      : RANGE_OPTIONS.find((item) => item.value === currentRange)?.label ??
                        'All time'}
                  </span>
                </span>
                <span>
                  Search:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedSearchQuery || search || '—'}
                  </span>
                </span>
                <span>
                  Exhibitor:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedExhibitorName
                      ? `${summary.appliedExhibitorName} (${summary.appliedExhibitorId})`
                      : '—'}
                  </span>
                </span>
                <span>
                  Dates:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedStartDate || summary.appliedEndDate
                      ? `${summary.appliedStartDate ?? 'Open'} → ${summary.appliedEndDate ?? 'Open'}`
                      : '—'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.map((option) => {
                const isActive =
                  !summary.appliedStartDate &&
                  !summary.appliedEndDate &&
                  option.value === currentRange

                return (
                  <ToolbarPill
                    key={option.value}
                    active={isActive}
                    href={buildReportsHref({
                      range: option.value,
                      exhibitorId: currentExhibitorId,
                      q: search || currentSearchQuery,
                    })}
                  >
                    {option.label}
                  </ToolbarPill>
                )
              })}

              <a
                href={getCsvHref(
                  currentRange,
                  currentExhibitorId,
                  search || currentSearchQuery,
                  summary.appliedStartDate,
                  summary.appliedEndDate
                )}
                className="rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Download CSV
              </a>

              <a
                href={getXlsxHref(
                  currentRange,
                  currentExhibitorId,
                  search || currentSearchQuery,
                  summary.appliedStartDate,
                  summary.appliedEndDate
                )}
                className="rounded-2xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Download XLSX
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-end">
            <form onSubmit={handleSearchSubmit}>
              <label
                htmlFor="top-report-search"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Search exhibitors
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="top-report-search"
                  type="text"
                  placeholder="Search by company name or exhibitor ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/20"
                />
                <button
                  type="submit"
                  className="rounded-2xl border border-white bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
                >
                  Apply search
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                This filters the explorer instantly and can also be applied to the full report URL.
              </p>
            </form>

            <form onSubmit={handleApplyExhibitorFilter}>
              <label
                htmlFor="top-exhibitor-picker"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Jump to one exhibitor
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="top-exhibitor-picker"
                  list="exhibitor-picker-options"
                  type="text"
                  value={exhibitorPickerValue}
                  onChange={(event) => setExhibitorPickerValue(event.target.value)}
                  placeholder="Type company name or ID"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/20"
                />
                <datalist id="exhibitor-picker-options">
                  {exhibitorOptions.map((item) => (
                    <option key={item.exhibitorId} value={item.label} />
                  ))}
                </datalist>
                <button
                  type="submit"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>

          {(summary.appliedSearchQuery ||
            summary.appliedExhibitorId ||
            summary.appliedStartDate ||
            summary.appliedEndDate ||
            search) ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/reports"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
              >
                Clear all filters
              </Link>

              {summary.appliedExhibitorId ? (
                <Link
                  href={buildReportsHref({
                    range: currentRange,
                    q: search || currentSearchQuery,
                    startDate: summary.appliedStartDate,
                    endDate: summary.appliedEndDate,
                  })}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
                >
                  Clear exhibitor
                </Link>
              ) : null}
            </div>
          ) : null}
        </Card>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Overview</h2>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              label="Total events"
              value={summary.totalEvents}
              sublabel="All tracked activity"
            />
            <KpiCard
              label="Exhibitors seen"
              value={summary.totalExhibitors}
              sublabel="Unique exhibitors"
            />
            <KpiCard
              label="Generator opens"
              value={summary.totalGeneratorOpens}
              sublabel="Sessions opened"
              tone="blue"
            />
            <KpiCard
              label="Exports succeeded"
              value={summary.totalExportsSucceeded}
              sublabel="Successful exports"
              tone="green"
            />
            <KpiCard
              label="Exports failed"
              value={summary.totalExportsFailed}
              sublabel="Failed exports"
              tone="red"
            />
            <KpiCard
              label="Open → Export"
              value={summary.conversionRate}
              sublabel="Conversion rate"
              tone="amber"
            />
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <CompactFocusCard
            title="Needs attention"
            value={String(needsAttention.length)}
            subtitle="Engaged exhibitors with no successful exports."
            onClick={() => activateFocusFilter('needsAttention')}
            tone="red"
          />

          <CompactFocusCard
            title="Top conversion"
            value={
              topPerformer
                ? `${Math.round(
                    getConversionRate(
                      topPerformer.generatorOpenedCount,
                      topPerformer.exportSucceededCount
                    ) * 100
                  )}%`
                : '0%'
            }
            subtitle={topPerformer ? topPerformer.companyName : 'No exhibitor data yet.'}
            onClick={() => activateFocusFilter('topPerformers')}
            tone="green"
          />

          <CompactFocusCard
            title="Zero conversion"
            value={String(zeroConversionCount)}
            subtitle="Exhibitors currently at 0% open-to-export conversion."
            onClick={() => activateFocusFilter('zeroConversion')}
            tone="amber"
          />

          <CompactFocusCard
            title="Failed exports"
            value={String(summary.totalExportsFailed)}
            subtitle="Total failed export events in the selected view."
            onClick={() => activateFocusFilter('failedExports')}
            tone="blue"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Top exhibitors by activity"
            description="Summary-only chart. Limited to the top exhibitors to keep the view readable."
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="name"
                    angle={-22}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    stroke="#a1a1aa"
                  />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 12 }} />
                  <Bar dataKey="totalEvents" name="Total events" fill="#60a5fa" isAnimationActive={false} />
                  <Bar dataKey="opens" name="Generator opens" fill="#a78bfa" isAnimationActive={false} />
                  <Bar dataKey="exports" name="Exports succeeded" fill="#34d399" isAnimationActive={false} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="format"
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    stroke="#a1a1aa"
                  />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 12 }} />
                  <Bar dataKey="count" name="Count" fill="#f59e0b" isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Generator opens over time"
            description="Daily generator opens and successful exports."
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
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="label" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="generatorOpened"
                    name="Generator opens"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="exportsSucceeded"
                    name="Exports succeeded"
                    stroke="#34d399"
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
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="label" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="exportsFailed"
                    name="Exports failed"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </MeasuredChart>
          </ChartCard>
        </section>

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-white">Needs attention</h2>
                <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
                  {needsAttention.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                Exhibitors with engagement but no successful exports.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNeedsAttentionExpanded((prev) => !prev)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
            >
              {needsAttentionExpanded ? 'Collapse table' : 'Expand table'}
            </button>
          </div>

          {needsAttention.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-red-500/20">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-red-500/10">
                    <tr className="border-b border-red-500/20 text-left">
                      <th className="px-5 py-3 font-medium text-red-100">Company</th>
                      <th className="px-5 py-3 font-medium text-red-100">Exhibitor ID</th>
                      <th className="px-5 py-3 font-medium text-red-100">Links</th>
                      <th className="px-5 py-3 font-medium text-red-100">Opens</th>
                      <th className="px-5 py-3 font-medium text-red-100">Exports</th>
                      <th className="px-5 py-3 font-medium text-red-100">Issue</th>
                      <th className="px-5 py-3 font-medium text-red-100">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleNeedsAttentionRows.map((item) => {
                      const issueLabel =
                        item.generatorOpenedCount > 0 && item.exportSucceededCount === 0
                          ? 'Opened generator but never exported'
                          : 'Generated links but no successful exports'

                      return (
                        <tr key={item.exhibitorId} className="border-b border-white/5 last:border-b-0">
                          <td className="px-5 py-4 text-white">{item.companyName}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.exhibitorId}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.linkGeneratedCount}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.generatorOpenedCount}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.exportSucceededCount}</td>
                          <td className="px-5 py-4 text-red-200">{issueLabel}</td>
                          <td className="px-5 py-4">
                            <Link
                              href={buildExhibitorDetailHref(item.exhibitorId, {
                                range: currentRange,
                                startDate: summary.appliedStartDate,
                                endDate: summary.appliedEndDate,
                              })}
                              className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:bg-white/10"
                            >
                              View details
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {!needsAttentionExpanded && needsAttention.length > 5 ? (
                <div className="border-t border-white/5 px-5 py-3 text-sm text-neutral-400">
                  Showing 5 of {needsAttention.length} exhibitors.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-neutral-400">
              No issues detected.
            </div>
          )}
        </Card>

        <Card id="exhibitor-explorer" className="p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Exhibitor explorer</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Scalable table with sorting, filtering, and pagination.
                </p>
              </div>

              <div>
                <label htmlFor="pageSize" className="mb-2 block text-sm font-medium text-neutral-300">
                  Rows per page
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setCurrentPage(1)
                  }}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-black">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FocusChip active={focusFilter === 'all'} onClick={() => activateFocusFilter('all')}>
                All exhibitors
              </FocusChip>
              <FocusChip
                active={focusFilter === 'activeOnly'}
                onClick={() => activateFocusFilter('activeOnly')}
              >
                Active only
              </FocusChip>
              <FocusChip
                active={focusFilter === 'needsAttention'}
                onClick={() => activateFocusFilter('needsAttention')}
              >
                Needs attention
              </FocusChip>
              <FocusChip
                active={focusFilter === 'zeroConversion'}
                onClick={() => activateFocusFilter('zeroConversion')}
              >
                Zero conversion
              </FocusChip>
              <FocusChip
                active={focusFilter === 'failedExports'}
                onClick={() => activateFocusFilter('failedExports')}
              >
                Failed exports
              </FocusChip>
              <FocusChip
                active={focusFilter === 'topPerformers'}
                onClick={() => activateFocusFilter('topPerformers')}
              >
                Top performers
              </FocusChip>
            </div>

            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-neutral-500">
                Showing {tableStartIndex}-{tableEndIndex} of {sortedExhibitorRows.length}
              </div>
              <div className="text-neutral-500">
                Current focus:{' '}
                <span className="font-medium text-white">
                  {focusFilter === 'all'
                    ? 'All exhibitors'
                    : focusFilter === 'activeOnly'
                    ? 'Active only'
                    : focusFilter === 'needsAttention'
                    ? 'Needs attention'
                    : focusFilter === 'zeroConversion'
                    ? 'Zero conversion'
                    : focusFilter === 'failedExports'
                    ? 'Failed exports'
                    : 'Top performers'}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-[1120px] w-full border-collapse text-sm">
                  <thead className="bg-white/[0.04]">
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('companyName')}
                          className="font-medium hover:underline"
                        >
                          Company{sortIndicator('companyName')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('exhibitorId')}
                          className="font-medium hover:underline"
                        >
                          Exhibitor ID{sortIndicator('exhibitorId')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('totalEvents')}
                          className="font-medium hover:underline"
                        >
                          Total events{sortIndicator('totalEvents')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('generatorOpenedCount')}
                          className="font-medium hover:underline"
                        >
                          Opens{sortIndicator('generatorOpenedCount')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('exportSucceededCount')}
                          className="font-medium hover:underline"
                        >
                          Successful exports{sortIndicator('exportSucceededCount')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('exportFailedCount')}
                          className="font-medium hover:underline"
                        >
                          Failed exports{sortIndicator('exportFailedCount')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('conversionRate')}
                          className="font-medium hover:underline"
                        >
                          Open → Export{sortIndicator('conversionRate')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button
                          type="button"
                          onClick={() => handleSort('lastActivityAt')}
                          className="font-medium hover:underline"
                        >
                          Last activity{sortIndicator('lastActivityAt')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExhibitorRows.length === 0 ? (
                      <tr>
                        <td className="px-5 py-6 text-neutral-500" colSpan={9}>
                          No exhibitors match your current filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedExhibitorRows.map((item) => {
                        const status = getLastActiveStatus(item.lastActivityAt)

                        return (
                          <tr key={item.exhibitorId} className="border-b border-white/5 align-top last:border-b-0">
                            <td className="px-5 py-4">
                              <Link
                                href={buildExhibitorDetailHref(item.exhibitorId, {
                                  range: currentRange,
                                  startDate: summary.appliedStartDate,
                                  endDate: summary.appliedEndDate,
                                })}
                                className="font-medium text-white underline-offset-4 hover:underline"
                              >
                                {item.companyName}
                              </Link>
                            </td>
                            <td className="px-5 py-4 text-neutral-300">{item.exhibitorId}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.totalEvents}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.generatorOpenedCount}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.exportSucceededCount}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.exportFailedCount}</td>
                            <td className="px-5 py-4 text-neutral-300">
                              {percentage(item.exportSucceededCount, item.generatorOpenedCount)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-2">
                                <div>
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                                  >
                                    {status.label}
                                  </span>
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {formatDate(item.lastActivityAt)}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <Link
                                href={buildExhibitorDetailHref(item.exhibitorId, {
                                  range: currentRange,
                                  startDate: summary.appliedStartDate,
                                  endDate: summary.appliedEndDate,
                                })}
                                className="inline-flex min-w-[110px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
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
            </div>

            {sortedExhibitorRows.length > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-neutral-500">
                  Page {Math.min(currentPage, totalPages)} of {totalPages}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage <= 1}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white">Funnel analytics</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Step-by-step progression through the generator journey.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="py-3 pr-4 font-medium text-neutral-300">Step</th>
                    <th className="py-3 pr-4 font-medium text-neutral-300">Count</th>
                    <th className="py-3 pr-4 font-medium text-neutral-300">From previous</th>
                    <th className="py-3 pr-4 font-medium text-neutral-300">From start</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelRows.map((item) => (
                    <tr key={item.key} className="border-b border-white/5 last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-white">{item.label}</td>
                      <td className="py-3 pr-4 text-neutral-300">{item.count}</td>
                      <td className="py-3 pr-4 text-neutral-300">{item.rateFromPrevious}</td>
                      <td className="py-3 pr-4 text-neutral-300">{item.rateFromStart}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white">Recent events</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Latest analytics events in the current filtered view.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="py-3 pr-4 font-medium text-neutral-300">Timestamp</th>
                    <th className="py-3 pr-4 font-medium text-neutral-300">Company</th>
                    <th className="py-3 pr-4 font-medium text-neutral-300">Event</th>
                    <th className="py-3 pr-4 font-medium text-neutral-300">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentEvents.length === 0 ? (
                    <tr>
                      <td className="py-4 text-neutral-500" colSpan={4}>
                        No events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    summary.recentEvents.slice(0, 12).map((event) => (
                      <tr key={event.id} className="border-b border-white/5 last:border-b-0">
                        <td className="py-3 pr-4 text-neutral-300">{formatDate(event.timestamp)}</td>
                        <td className="py-3 pr-4">
                          <Link
                            href={buildExhibitorDetailHref(event.exhibitorId, {
                              range: currentRange,
                              startDate: summary.appliedStartDate,
                              endDate: summary.appliedEndDate,
                            })}
                            className="text-white underline-offset-4 hover:underline"
                          >
                            {event.companyName}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-neutral-300">{event.eventType}</td>
                        <td className="py-3 pr-4 text-neutral-300">
                          {event.format ? formatFormatLabel(event.format) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </main>
  )
}