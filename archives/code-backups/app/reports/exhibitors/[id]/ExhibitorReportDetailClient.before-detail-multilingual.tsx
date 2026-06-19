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
  availableExhibitors: {
    exhibitorId: string
    companyName: string
  }[]
  appliedExhibitorId: string | null
  appliedExhibitorName: string | null
  appliedSearchQuery: string | null
  appliedStartDate: string | null
  appliedEndDate: string | null
  funnel: FunnelSummary
}

type Props = {
  exhibitor: ExhibitorSummary
  summary: Summary
  currentRange: string
}

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
] as const

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

function buildDetailHref(
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

function buildBackToReportsHref(
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

  params.set('exhibitorId', exhibitorId)

  return `/reports?${params.toString()}`
}

function getCsvHref(
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

  params.set('exhibitorId', exhibitorId)

  return `/api/reports/csv?${params.toString()}`
}

function getXlsxHref(
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

  params.set('exhibitorId', exhibitorId)

  return `/api/reports/xlsx?${params.toString()}`
}

function getActivityStatus(value: string | null): {
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
    <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-neutral-400">{description}</p>

      <div className="mt-6 h-[320px] min-w-0">
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

function KpiCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | number
  tone?: 'default' | 'green' | 'blue' | 'amber' | 'red'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-500/20 bg-emerald-500/10'
      : tone === 'blue'
      ? 'border-blue-500/20 bg-blue-500/10'
      : tone === 'amber'
      ? 'border-amber-500/20 bg-amber-500/10'
      : tone === 'red'
      ? 'border-red-500/20 bg-red-500/10'
      : 'border-white/10 bg-white/[0.04]'

  return (
    <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ${toneClasses}`}>
      <div className="text-sm text-neutral-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  )
}

function InsightCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string
  value: string
  subtitle: string
  tone: 'red' | 'emerald' | 'blue' | 'amber'
}) {
  const toneClasses =
    tone === 'red'
      ? 'border-red-500/20 bg-red-500/10'
      : tone === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10'
      : tone === 'blue'
      ? 'border-blue-500/20 bg-blue-500/10'
      : 'border-amber-500/20 bg-amber-500/10'

  return (
    <div className={`rounded-3xl border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ${toneClasses}`}>
      <div className="text-sm font-medium text-neutral-200">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm text-neutral-300">{subtitle}</p>
    </div>
  )
}

function EmptyRangeState({
  exhibitorId,
  currentRange,
  appliedStartDate,
  appliedEndDate,
}: {
  exhibitorId: string
  currentRange: string
  appliedStartDate: string | null
  appliedEndDate: string | null
}) {
  return (
    <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <h2 className="text-xl font-semibold text-amber-100">
        No activity in this date range
      </h2>
      <p className="mt-2 text-sm text-amber-200">
        This exhibitor has no analytics events for the currently selected period.
        Try expanding the date range to see more activity.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildDetailHref(exhibitorId, { range: '30d' })}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            currentRange === '30d' && !appliedStartDate && !appliedEndDate
              ? 'border-white bg-white text-black'
              : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
          }`}
        >
          View 30 days
        </Link>

        <Link
          href={buildDetailHref(exhibitorId, { range: '90d' })}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            currentRange === '90d' && !appliedStartDate && !appliedEndDate
              ? 'border-white bg-white text-black'
              : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
          }`}
        >
          View 90 days
        </Link>

        <Link
          href={buildDetailHref(exhibitorId, { range: 'all' })}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            currentRange === 'all' && !appliedStartDate && !appliedEndDate
              ? 'border-white bg-white text-black'
              : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
          }`}
        >
          View all time
        </Link>
      </div>
    </section>
  )
}

export default function ExhibitorReportDetailClient({
  exhibitor,
  summary,
  currentRange,
}: Props) {
  const [chartsReady, setChartsReady] = useState(false)

  useEffect(() => {
    setChartsReady(true)
  }, [])

  const formatUsageChartData = useMemo(() => {
    return Object.entries(exhibitor.formats)
      .sort((a, b) => b[1] - a[1])
      .map(([format, count]) => ({
        format: formatFormatLabel(format),
        count,
      }))
  }, [exhibitor.formats])

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

  const hasAnyActivity = exhibitor.totalEvents > 0
  const activityStatus = getActivityStatus(exhibitor.lastActivityAt)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={buildBackToReportsHref(exhibitor.exhibitorId, {
                    range: currentRange,
                    startDate: summary.appliedStartDate,
                    endDate: summary.appliedEndDate,
                  })}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
                >
                  ← Back to reports
                </Link>
              </div>

              <div className="mt-4 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                Exhibitor detail
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {exhibitor.companyName}
              </h1>

              <p className="mt-2 text-sm text-neutral-400">
                Detailed analytics for one exhibitor.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300">
                  Exhibitor ID: {exhibitor.exhibitorId}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${activityStatus.className}`}
                >
                  {activityStatus.label}
                </span>
              </div>

              <p className="mt-3 text-sm text-neutral-500">
                Range:{' '}
                <span className="font-medium text-white">
                  {summary.appliedStartDate || summary.appliedEndDate
                    ? `${summary.appliedStartDate ?? 'Open'} → ${summary.appliedEndDate ?? 'Open'}`
                    : RANGE_OPTIONS.find((item) => item.value === currentRange)?.label ??
                      'All time'}
                </span>
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
                    href={buildDetailHref(exhibitor.exhibitorId, { range: option.value })}
                    className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-white bg-white text-black'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </Link>
                )
              })}

              <a
                href={getCsvHref(exhibitor.exhibitorId, {
                  range: currentRange,
                  startDate: summary.appliedStartDate,
                  endDate: summary.appliedEndDate,
                })}
                className="rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Download CSV
              </a>

              <a
                href={getXlsxHref(exhibitor.exhibitorId, {
                  range: currentRange,
                  startDate: summary.appliedStartDate,
                  endDate: summary.appliedEndDate,
                })}
                className="rounded-2xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Download XLSX
              </a>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <form
            method="get"
            action={`/reports/exhibitors/${encodeURIComponent(exhibitor.exhibitorId)}`}
            className="grid gap-3 lg:grid-cols-[180px_180px_auto] lg:items-end"
          >
            <div>
              <label
                htmlFor="detailStartDate"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Start date
              </label>
              <input
                id="detailStartDate"
                name="startDate"
                type="date"
                defaultValue={summary.appliedStartDate ?? ''}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
              />
            </div>

            <div>
              <label
                htmlFor="detailEndDate"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                End date
              </label>
              <input
                id="detailEndDate"
                name="endDate"
                type="date"
                defaultValue={summary.appliedEndDate ?? ''}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
              />
            </div>

            <div className="flex gap-2">
              <input type="hidden" name="range" value={currentRange} />
              <button
                type="submit"
                className="rounded-2xl border border-white bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                Apply dates
              </button>

              {summary.appliedStartDate || summary.appliedEndDate ? (
                <Link
                  href={buildDetailHref(exhibitor.exhibitorId, { range: currentRange })}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
                >
                  Clear dates
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        {!hasAnyActivity ? (
          <EmptyRangeState
            exhibitorId={exhibitor.exhibitorId}
            currentRange={currentRange}
            appliedStartDate={summary.appliedStartDate}
            appliedEndDate={summary.appliedEndDate}
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total Events" value={exhibitor.totalEvents} />
          <KpiCard label="Links Generated" value={exhibitor.linkGeneratedCount} />
          <KpiCard label="Generator Opens" value={exhibitor.generatorOpenedCount} tone="blue" />
          <KpiCard label="Exports Succeeded" value={exhibitor.exportSucceededCount} tone="green" />
          <KpiCard label="Exports Failed" value={exhibitor.exportFailedCount} tone="red" />
          <KpiCard
            label="Open → Export"
            value={percentage(exhibitor.exportSucceededCount, exhibitor.generatorOpenedCount)}
            tone="amber"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            title="Conversion"
            value={percentage(
              exhibitor.exportSucceededCount,
              exhibitor.generatorOpenedCount
            )}
            subtitle="Successful exports from generator opens"
            tone="emerald"
          />

          <InsightCard
            title="Failures"
            value={String(exhibitor.exportFailedCount)}
            subtitle="Failed export attempts in this view"
            tone="blue"
          />

          <InsightCard
            title="Session verified"
            value={String(exhibitor.sessionVerifiedCount)}
            subtitle="Verified sessions recorded"
            tone="amber"
          />

          <InsightCard
            title="Needs review"
            value={
              exhibitor.generatedLinkButNeverExported || exhibitor.exportFailedCount > 0
                ? 'Yes'
                : 'No'
            }
            subtitle="Quick status flag for follow-up"
            tone={
              exhibitor.generatedLinkButNeverExported || exhibitor.exportFailedCount > 0
                ? 'red'
                : 'emerald'
            }
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Funnel analytics"
            description="Step-by-step progression for this exhibitor."
            emptyMessage="No funnel activity recorded for this exhibitor."
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis type="number" allowDecimals={false} stroke="#a1a1aa" />
                  <YAxis type="category" dataKey="label" width={130} stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" name="Count" fill="#60a5fa" isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <h2 className="text-xl font-semibold text-white">Funnel step breakdown</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Conversion from each previous step.
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
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <h2 className="text-xl font-semibold text-white">Exhibitor summary</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Core engagement and status for this exhibitor.
            </p>

            <div className="mt-4 space-y-3 text-sm text-neutral-300">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Company name</span>
                <span className="font-medium text-white">{exhibitor.companyName}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Exhibitor ID</span>
                <span className="font-medium text-white">{exhibitor.exhibitorId}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Session verified</span>
                <span className="font-medium text-white">{exhibitor.sessionVerifiedCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Export clicked</span>
                <span className="font-medium text-white">{exhibitor.exportClickedCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Generated link but never exported</span>
                <span className="font-medium text-white">
                  {exhibitor.generatedLinkButNeverExported ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Last activity</span>
                <span className="font-medium text-white">{formatDate(exhibitor.lastActivityAt)}</span>
              </div>
            </div>
          </div>

          <ChartCard
            title="Export format usage"
            description="Formats used by this exhibitor in the selected range."
            emptyMessage="No export data to chart for this exhibitor."
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
                  <Legend />
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
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
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
                  <Legend />
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
            description="Failed exports by day for this exhibitor."
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
                  <Legend />
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

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Recent events</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Most recent analytics events for this exhibitor.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-3 pr-4 font-medium text-neutral-300">Timestamp</th>
                  <th className="py-3 pr-4 font-medium text-neutral-300">Event</th>
                  <th className="py-3 pr-4 font-medium text-neutral-300">Format</th>
                  <th className="py-3 pr-4 font-medium text-neutral-300">Environment</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentEvents.length === 0 ? (
                  <tr>
                    <td className="py-4 text-neutral-500" colSpan={4}>
                      No events recorded for this exhibitor.
                    </td>
                  </tr>
                ) : (
                  summary.recentEvents.map((event) => (
                    <tr key={event.id} className="border-b border-white/5 last:border-b-0">
                      <td className="py-3 pr-4 text-neutral-300">{formatDate(event.timestamp)}</td>
                      <td className="py-3 pr-4 text-neutral-300">{event.eventType}</td>
                      <td className="py-3 pr-4 text-neutral-300">
                        {event.format ? formatFormatLabel(event.format) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-neutral-300">{event.environment}</td>
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