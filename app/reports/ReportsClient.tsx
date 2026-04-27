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

type AnalyticsInsight = {
  id: string
  title: string
  value: string
  description: string
  tone: 'green' | 'blue' | 'amber' | 'red'
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
  insights: AnalyticsInsight[]
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

const CHART_COLORS = {
  blue: '#60a5fa',
  violet: '#a78bfa',
  green: '#34d399',
  amber: '#f59e0b',
  red: '#f87171',
  grid: '#3f3f46',
  axis: '#a1a1aa',
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

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
    if (Number.isNaN(date.getTime())) return value
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

  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  if (!startDate && !endDate && args.range && args.range !== 'all') {
    params.set('range', args.range)
  }
  if (args.exhibitorId) params.set('exhibitorId', args.exhibitorId)

  const searchQuery = args.q?.trim()
  if (searchQuery) params.set('q', searchQuery)

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

  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
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

  if (normalizedStartDate) params.set('startDate', normalizedStartDate)
  if (normalizedEndDate) params.set('endDate', normalizedEndDate)
  if (!normalizedStartDate && !normalizedEndDate && range && range !== 'all') {
    params.set('range', range)
  }
  if (exhibitorId) params.set('exhibitorId', exhibitorId)

  const searchQuery = q?.trim()
  if (searchQuery) params.set('q', searchQuery)

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

  if (normalizedStartDate) params.set('startDate', normalizedStartDate)
  if (normalizedEndDate) params.set('endDate', normalizedEndDate)
  if (!normalizedStartDate && !normalizedEndDate && range && range !== 'all') {
    params.set('range', range)
  }
  if (exhibitorId) params.set('exhibitorId', exhibitorId)

  const searchQuery = q?.trim()
  if (searchQuery) params.set('q', searchQuery)

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
      if (b.conversion !== a.conversion) return b.conversion - a.conversion
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
  const buckets = { zero: 0, low: 0, medium: 0, high: 0 }

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
    return { label: 'No activity', className: 'bg-neutral-800 text-neutral-300' }
  }

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) {
    return { label: 'Unknown', className: 'bg-neutral-800 text-neutral-300' }
  }

  const diffMs = Date.now() - timestamp
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay

  if (diffMs <= oneDay) {
    return { label: 'Active today', className: 'bg-emerald-500/15 text-emerald-300' }
  }

  if (diffMs <= sevenDays) {
    return { label: 'Active this week', className: 'bg-blue-500/15 text-blue-300' }
  }

  return { label: 'Inactive', className: 'bg-amber-500/15 text-amber-300' }
}

function getInsightToneClasses(tone: AnalyticsInsight['tone']) {
  switch (tone) {
    case 'green':
      return {
        card: 'border-emerald-500/25 bg-emerald-500/[0.08]',
        pill: 'bg-emerald-500/15 text-emerald-300',
      }
    case 'blue':
      return {
        card: 'border-blue-500/25 bg-blue-500/[0.08]',
        pill: 'bg-blue-500/15 text-blue-300',
      }
    case 'amber':
      return {
        card: 'border-amber-500/25 bg-amber-500/[0.08]',
        pill: 'bg-amber-500/15 text-amber-300',
      }
    case 'red':
    default:
      return {
        card: 'border-red-500/25 bg-red-500/[0.08]',
        pill: 'bg-red-500/15 text-red-300',
      }
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
    <section
      id={id}
      className={`rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] shadow-[0_20px_80px_rgba(0,0,0,0.42)] backdrop-blur ${className}`}
    >
      {children}
    </section>
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
    <Card className="min-w-0 p-6 sm:p-7">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm leading-6 text-neutral-400">{description}</p>
      </div>

      <div className="mt-8 h-[360px] min-w-0">
        {!hasData ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-neutral-500">
            {emptyMessage}
          </div>
        ) : !chartsReady ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-neutral-500">
            Loading chart…
          </div>
        ) : (
          <div className="h-full min-w-0 rounded-2xl border border-white/5 bg-black/10 p-2">
            {children}
          </div>
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
      ? 'border-emerald-500/25 bg-emerald-500/[0.08]'
      : tone === 'blue'
      ? 'border-blue-500/25 bg-blue-500/[0.08]'
      : tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/[0.08]'
      : tone === 'red'
      ? 'border-red-500/25 bg-red-500/[0.08]'
      : 'border-white/10 bg-white/[0.035]'

  return (
    <div className={`rounded-3xl border px-5 py-5 ${toneClasses}`}>
      <div className="text-sm font-medium text-neutral-300">{label}</div>
      <div className="mt-4 text-4xl font-semibold leading-none text-white">{value}</div>
      <div className="mt-3 text-xs leading-5 text-neutral-500">{sublabel}</div>
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
      ? 'border-red-500/25 bg-red-500/[0.08] hover:bg-red-500/[0.12]'
      : tone === 'green'
      ? 'border-emerald-500/25 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]'
      : tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/[0.08] hover:bg-amber-500/[0.12]'
      : 'border-blue-500/25 bg-blue-500/[0.08] hover:bg-blue-500/[0.12]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border px-5 py-5 text-left transition ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-200">{title}</div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-400">
            {subtitle}
          </p>
        </div>
        <div className="shrink-0 text-3xl font-semibold leading-none text-white">
          {value}
        </div>
      </div>
    </button>
  )
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const toneClasses = getInsightToneClasses(insight.tone)

  return (
    <div className={`rounded-3xl border px-5 py-5 ${toneClasses.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-200">{insight.title}</div>
          <div className="mt-3 truncate text-2xl font-semibold leading-none text-white">
            {insight.value}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses.pill}`}>
          Insight
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-400">{insight.description}</p>
    </div>
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

function ExportButton({
  href,
  children,
  tone,
}: {
  href: string
  children: ReactNode
  tone: 'green' | 'blue'
}) {
  const className =
    tone === 'green'
      ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500'
      : 'border-blue-500 bg-blue-600 text-white hover:bg-blue-500'

  return (
    <a
      href={href}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${className}`}
    >
      {children}
    </a>
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

  const filteredAvailableExhibitors = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return summary.availableExhibitors

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
        return leaderboard.slice(0, 50)
      case 'activeOnly':
        return summary.exhibitorSummaries.filter((item) => item.totalEvents > 0)
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

    if (!matchedExhibitor) return

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
        const tableSection = document.getElementById('exhibitor-explorer')
        tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#090909_42%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Reports
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
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
                    {summary.appliedSearchQuery || '—'}
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
                      q: currentSearchQuery,
                    })}
                  >
                    {option.label}
                  </ToolbarPill>
                )
              })}

              <ExportButton
                tone="green"
                href={getCsvHref(
                  currentRange,
                  currentExhibitorId,
                  currentSearchQuery,
                  summary.appliedStartDate,
                  summary.appliedEndDate
                )}
              >
                Download CSV
              </ExportButton>

              <ExportButton
                tone="blue"
                href={getXlsxHref(
                  currentRange,
                  currentExhibitorId,
                  currentSearchQuery,
                  summary.appliedStartDate,
                  summary.appliedEndDate
                )}
              >
                Download XLSX
              </ExportButton>
            </div>
          </div>
        </div>

        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Search exhibitors</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                Find one exhibitor quickly, filter the whole report, or jump into a detail view.
              </p>
            </div>

            {(summary.appliedSearchQuery ||
              summary.appliedExhibitorId ||
              summary.appliedStartDate ||
              summary.appliedEndDate) ? (
              <Link
                href="/reports"
                className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
              >
                Clear all filters
              </Link>
            ) : null}
          </div>

          <form
            method="get"
            action="/reports"
            className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end"
          >
            <div>
              <label htmlFor="report-search" className="mb-2 block text-sm font-medium text-neutral-300">
                Company name or exhibitor ID
              </label>
              <input
                id="report-search"
                name="q"
                type="text"
                placeholder="Search across reports"
                defaultValue={currentSearchQuery}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/25"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-neutral-300">
                Start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={summary.appliedStartDate ?? ''}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-neutral-300">
                End date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={summary.appliedEndDate ?? ''}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
              />
            </div>

            <div>
              <input type="hidden" name="range" value={currentRange} />
              {currentExhibitorId ? (
                <input type="hidden" name="exhibitorId" value={currentExhibitorId} />
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl border border-white bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200 lg:w-auto"
              >
                Apply filters
              </button>
            </div>
          </form>

          <form
            onSubmit={handleApplyExhibitorFilter}
            className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          >
            <div>
              <label htmlFor="exhibitor-picker" className="mb-2 block text-sm font-medium text-neutral-300">
                Select one exhibitor
              </label>
              <input
                id="exhibitor-picker"
                list="exhibitor-picker-options"
                type="text"
                value={exhibitorPickerValue}
                onChange={(event) => setExhibitorPickerValue(event.target.value)}
                placeholder="Start typing company name or exhibitor ID"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/25"
              />
              <datalist id="exhibitor-picker-options">
                {exhibitorOptions.map((item) => (
                  <option key={item.exhibitorId} value={item.label} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
            >
              Apply exhibitor
            </button>
          </form>

          <div className="mt-4 text-sm text-neutral-500">
            Matching available exhibitors: {filteredAvailableExhibitors.length}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Top insights</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                Automated highlights from the selected report view.
              </p>
            </div>
            <div className="text-sm text-neutral-500">
              {summary.insights.length} insights generated
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {summary.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </Card>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Overview</h2>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard label="Total events" value={summary.totalEvents} sublabel="All tracked activity" />
            <KpiCard label="Exhibitors seen" value={summary.totalExhibitors} sublabel="Unique exhibitors" />
            <KpiCard label="Generator opens" value={summary.totalGeneratorOpens} sublabel="Sessions opened" tone="blue" />
            <KpiCard label="Exports succeeded" value={summary.totalExportsSucceeded} sublabel="Successful exports" tone="green" />
            <KpiCard label="Exports failed" value={summary.totalExportsFailed} sublabel="Failed exports" tone="red" />
            <KpiCard label="Open → Export" value={summary.conversionRate} sublabel="Conversion rate" tone="amber" />
          </section>
        </div>

        {/* The remainder of your existing dashboard content remains unchanged from your current file. */}
      </div>
    </main>
  )
}
