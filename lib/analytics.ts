import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import type {
  AnalyticsEnvironment,
  AnalyticsEvent,
  AnalyticsEventInput,
  AnalyticsSummary,
  ExhibitorAnalyticsSummary,
} from './analytics-types'
import {
  ensureAnalyticsTable,
  getAnalyticsDb,
  isAnalyticsDbEnabled,
} from './analytics-db'

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'analytics-events.jsonl')
const ANALYTICS_TIMEOUT_MS = 3000

declare global {
  // eslint-disable-next-line no-var
  var __inviteAnalyticsEvents: AnalyticsEvent[] | undefined
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

function getEnvironment(): AnalyticsEnvironment {
  if (process.env.NODE_ENV === 'test') {
    return 'test'
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview'
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
  ) {
    return 'development'
  }

  return 'production'
}

function getMemoryStore(): AnalyticsEvent[] {
  if (!global.__inviteAnalyticsEvents) {
    global.__inviteAnalyticsEvents = []
  }
  return global.__inviteAnalyticsEvents
}

function normalizeEvent(input: AnalyticsEventInput): AnalyticsEvent {
  return {
    id: randomUUID(),
    exhibitorId: String(input.exhibitorId),
    companyName: input.companyName?.trim() || 'Unknown Exhibitor',
    eventType: input.eventType,
    format: input.format ?? null,
    timestamp: input.timestamp ?? new Date().toISOString(),
    environment: input.environment ?? getEnvironment(),
    metadata: input.metadata ?? {},
  }
}

function logAnalyticsWarning(message: string, error?: unknown) {
  console.warn(`[ANALYTICS WARNING] ${message}`)

  if (error) {
    console.warn(error)
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs = ANALYTICS_TIMEOUT_MS
): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }),
  ])
}

async function appendToLocalFile(event: AnalyticsEvent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.appendFile(DATA_FILE, `${JSON.stringify(event)}\n`, 'utf8')
}

async function readFromLocalFile(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const parsed: AnalyticsEvent[] = []

    for (const line of lines) {
      try {
        parsed.push(JSON.parse(line) as AnalyticsEvent)
      } catch {
        // ignore malformed rows
      }
    }

    return parsed
  } catch {
    return []
  }
}

function dedupeEvents(events: AnalyticsEvent[]): AnalyticsEvent[] {
  const map = new Map<string, AnalyticsEvent>()

  for (const event of events) {
    map.set(event.id, event)
  }

  return Array.from(map.values()).sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : -1
  )
}

function increment(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1
}

function startOfDayIso(date: Date): string {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.toISOString()
}

function endOfDayIso(date: Date): string {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy.toISOString()
}

function normalizeSearchQuery(query?: string): string | undefined {
  const normalized = query?.trim()
  return normalized ? normalized : undefined
}

function normalizeDateInput(value?: string): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function isValidDateOnly(value?: string): boolean {
  if (!value) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function filterEventsByRange(
  events: AnalyticsEvent[],
  options?: {
    rangeDays?: number
    startDate?: string
    endDate?: string
  }
): AnalyticsEvent[] {
  const startDate = normalizeDateInput(options?.startDate)
  const endDate = normalizeDateInput(options?.endDate)

  if (isValidDateOnly(startDate) || isValidDateOnly(endDate)) {
    const startIso = isValidDateOnly(startDate)
      ? startOfDayIso(new Date(`${startDate}T00:00:00`))
      : null

    const endIso = isValidDateOnly(endDate)
      ? endOfDayIso(new Date(`${endDate}T00:00:00`))
      : null

    return events.filter((event) => {
      if (startIso && event.timestamp < startIso) return false
      if (endIso && event.timestamp > endIso) return false
      return true
    })
  }

  if (!options?.rangeDays || options.rangeDays <= 0) {
    return events
  }

  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(now.getDate() - (options.rangeDays - 1))
  const cutoffIso = startOfDayIso(cutoff)

  return events.filter((event) => event.timestamp >= cutoffIso)
}

function filterEventsByExhibitor(
  events: AnalyticsEvent[],
  exhibitorId?: string
): AnalyticsEvent[] {
  if (!exhibitorId) {
    return events
  }

  const normalized = exhibitorId.trim()

  if (!normalized) {
    return events
  }

  return events.filter((event) => event.exhibitorId === normalized)
}

function filterEventsBySearchQuery(
  events: AnalyticsEvent[],
  query?: string
): AnalyticsEvent[] {
  const normalized = normalizeSearchQuery(query)?.toLowerCase()

  if (!normalized) {
    return events
  }

  return events.filter((event) => {
    const companyName = event.companyName.toLowerCase()
    const exhibitorId = event.exhibitorId.toLowerCase()

    return companyName.includes(normalized) || exhibitorId.includes(normalized)
  })
}

function buildDailySeries(
  events: AnalyticsEvent[],
  options?: {
    rangeDays?: number
    startDate?: string
    endDate?: string
  }
) {
  const explicitStart = normalizeDateInput(options?.startDate)
  const explicitEnd = normalizeDateInput(options?.endDate)

  let startDate: Date | null = null
  let endDate: Date | null = null

  if (isValidDateOnly(explicitStart) || isValidDateOnly(explicitEnd)) {
    startDate = isValidDateOnly(explicitStart)
      ? new Date(`${explicitStart}T00:00:00`)
      : null
    endDate = isValidDateOnly(explicitEnd)
      ? new Date(`${explicitEnd}T00:00:00`)
      : null

    if (!startDate && endDate) {
      startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 29)
    }

    if (startDate && !endDate) {
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 29)
    }
  } else if (options?.rangeDays && options.rangeDays > 0) {
    endDate = new Date()
    startDate = new Date()
    startDate.setDate(endDate.getDate() - (options.rangeDays - 1))
  }

  if (!startDate || !endDate) {
    return []
  }

  const days: {
    date: string
    generatorOpened: number
    exportsSucceeded: number
    exportsFailed: number
  }[] = []

  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    const key = cursor.toISOString().slice(0, 10)

    days.push({
      date: key,
      generatorOpened: 0,
      exportsSucceeded: 0,
      exportsFailed: 0,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  const map = new Map(days.map((day) => [day.date, day]))

  for (const event of events) {
    const key = event.timestamp.slice(0, 10)
    const row = map.get(key)

    if (!row) continue

    if (event.eventType === 'generator_opened') {
      row.generatorOpened += 1
    }

    if (event.eventType === 'export_succeeded') {
      row.exportsSucceeded += 1
    }

    if (event.eventType === 'export_failed') {
      row.exportsFailed += 1
    }
  }

  return days
}

function percentage(numerator: number, denominator: number): string {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

function buildFunnelSummary(events: AnalyticsEvent[]): FunnelSummary {
  const counts = {
    link_generated: 0,
    generator_opened: 0,
    session_verified: 0,
    export_clicked: 0,
    export_succeeded: 0,
    export_failed: 0,
  }

  for (const event of events) {
    switch (event.eventType) {
      case 'link_generated':
        counts.link_generated += 1
        break
      case 'generator_opened':
        counts.generator_opened += 1
        break
      case 'session_verified':
        counts.session_verified += 1
        break
      case 'export_clicked':
        counts.export_clicked += 1
        break
      case 'export_succeeded':
        counts.export_succeeded += 1
        break
      case 'export_failed':
        counts.export_failed += 1
        break
    }
  }

  const starts = counts.link_generated

  const rawSteps: Array<{
    key: FunnelStep['key']
    label: string
    count: number
  }> = [
    { key: 'link_generated', label: 'Link generated', count: counts.link_generated },
    { key: 'generator_opened', label: 'Generator opened', count: counts.generator_opened },
    { key: 'session_verified', label: 'Session verified', count: counts.session_verified },
    { key: 'export_clicked', label: 'Export clicked', count: counts.export_clicked },
    { key: 'export_succeeded', label: 'Export succeeded', count: counts.export_succeeded },
    { key: 'export_failed', label: 'Export failed', count: counts.export_failed },
  ]

  const steps: FunnelStep[] = rawSteps.map((step, index) => {
    const previous = index === 0 ? step.count : rawSteps[index - 1].count

    return {
      key: step.key,
      label: step.label,
      count: step.count,
      rateFromPrevious: percentage(step.count, previous),
      rateFromStart: percentage(step.count, starts),
    }
  })

  return {
    steps,
    starts,
  }
}

async function logAnalyticsEventToDb(event: AnalyticsEvent): Promise<void> {
  const sql = getAnalyticsDb()

  if (!sql) {
    throw new Error('Analytics database is not configured')
  }

  await withTimeout(
    ensureAnalyticsTable(),
    'Ensuring analytics table'
  )

  await withTimeout(
    sql`
      insert into analytics_events (
        id,
        exhibitor_id,
        company_name,
        event_type,
        format,
        timestamp,
        environment,
        metadata
      ) values (
        ${event.id},
        ${event.exhibitorId},
        ${event.companyName},
        ${event.eventType},
        ${event.format},
        ${event.timestamp},
        ${event.environment},
        ${JSON.stringify(event.metadata ?? {})}::jsonb
      )
      on conflict (id) do nothing
    `,
    'Writing analytics event'
  )
}

async function readAnalyticsEventsFromDb(): Promise<AnalyticsEvent[]> {
  const sql = getAnalyticsDb()

  if (!sql) {
    return []
  }

  await withTimeout(
    ensureAnalyticsTable(),
    'Ensuring analytics table'
  )

  const rows = await withTimeout(
    sql<{
      id: string
      exhibitor_id: string
      company_name: string
      event_type: AnalyticsEvent['eventType']
      format: AnalyticsEvent['format']
      timestamp: string | Date
      environment: AnalyticsEnvironment
      metadata: Record<string, string | number | boolean | null> | null
    }[]>`
      select
        id,
        exhibitor_id,
        company_name,
        event_type,
        format,
        timestamp,
        environment,
        metadata
      from analytics_events
      order by timestamp desc
    `,
    'Reading analytics events'
  )

  return rows.map((row) => ({
    id: row.id,
    exhibitorId: row.exhibitor_id,
    companyName: row.company_name,
    eventType: row.event_type,
    format: row.format ?? null,
    timestamp:
      row.timestamp instanceof Date
        ? row.timestamp.toISOString()
        : new Date(row.timestamp).toISOString(),
    environment: row.environment,
    metadata: row.metadata ?? {},
  }))
}

async function persistAnalyticsFallback(event: AnalyticsEvent): Promise<void> {
  getMemoryStore().push(event)

  try {
    await withTimeout(
      appendToLocalFile(event),
      'Writing analytics fallback file'
    )
  } catch (error) {
    logAnalyticsWarning('Failed to append analytics event to local file fallback', error)
  }
}

export async function logAnalyticsEvent(
  input: AnalyticsEventInput
): Promise<AnalyticsEvent> {
  const event = normalizeEvent(input)

  if (isAnalyticsDbEnabled()) {
    try {
      await logAnalyticsEventToDb(event)
      return event
    } catch (error) {
      logAnalyticsWarning(
        'Database write failed. Falling back to local analytics storage.',
        error
      )
    }
  } else {
    logAnalyticsWarning(
      'Analytics database is not enabled. Using local analytics storage fallback.'
    )
  }

  await persistAnalyticsFallback(event)
  return event
}

export async function readAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  if (isAnalyticsDbEnabled()) {
    try {
      const dbEvents = await readAnalyticsEventsFromDb()
      const fallbackEvents = [
        ...getMemoryStore(),
        ...(await readFromLocalFile()),
      ]

      return dedupeEvents([...dbEvents, ...fallbackEvents])
    } catch (error) {
      logAnalyticsWarning(
        'Failed to read analytics from database. Falling back to local analytics storage.',
        error
      )
    }
  }

  const memoryEvents = getMemoryStore()
  const fileEvents = await readFromLocalFile()

  return dedupeEvents([...fileEvents, ...memoryEvents])
}

export async function getAnalyticsSummary(options?: {
  rangeDays?: number
  startDate?: string
  endDate?: string
  exhibitorId?: string
  searchQuery?: string
}): Promise<
  AnalyticsSummary & {
    dailySeries: {
      date: string
      generatorOpened: number
      exportsSucceeded: number
      exportsFailed: number
    }[]
    availableExhibitors: {
      exhibitorId: string
      companyName: string
    }[]
    appliedExhibitorId: string | null
    appliedExhibitorName: string | null
    appliedSearchQuery: string | null
    appliedStartDate: string | null
    appliedEndDate: string | null
    totalGeneratorOpens: number
    conversionRate: string
    funnel: FunnelSummary
  }
> {
  const allEvents = await readAnalyticsEvents()

  const eventsInRange = filterEventsByRange(allEvents, {
    rangeDays: options?.rangeDays,
    startDate: options?.startDate,
    endDate: options?.endDate,
  })

  const appliedSearchQuery = normalizeSearchQuery(options?.searchQuery) ?? null
  const appliedStartDate = isValidDateOnly(options?.startDate)
    ? options?.startDate ?? null
    : null
  const appliedEndDate = isValidDateOnly(options?.endDate)
    ? options?.endDate ?? null
    : null

  const availableExhibitorsMap = new Map<
    string,
    { exhibitorId: string; companyName: string }
  >()

  for (const event of filterEventsBySearchQuery(
    eventsInRange,
    appliedSearchQuery ?? undefined
  )) {
    if (!availableExhibitorsMap.has(event.exhibitorId)) {
      availableExhibitorsMap.set(event.exhibitorId, {
        exhibitorId: event.exhibitorId,
        companyName: event.companyName,
      })
    }
  }

  const availableExhibitors = Array.from(availableExhibitorsMap.values()).sort((a, b) => {
    const companyCompare = a.companyName.localeCompare(b.companyName)
    if (companyCompare !== 0) return companyCompare
    return a.exhibitorId.localeCompare(b.exhibitorId)
  })

  const eventsMatchingSearch = filterEventsBySearchQuery(
    eventsInRange,
    appliedSearchQuery ?? undefined
  )

  const events = filterEventsByExhibitor(eventsMatchingSearch, options?.exhibitorId)

  const exhibitorMap = new Map<string, ExhibitorAnalyticsSummary>()
  const formatUsage: Record<string, number> = {}

  for (const event of events) {
    const exhibitorKey = event.exhibitorId

    if (!exhibitorMap.has(exhibitorKey)) {
      exhibitorMap.set(exhibitorKey, {
        exhibitorId: event.exhibitorId,
        companyName: event.companyName,
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
      })
    }

    const summary = exhibitorMap.get(exhibitorKey)!

    summary.totalEvents += 1

    if (!summary.companyName && event.companyName) {
      summary.companyName = event.companyName
    }

    if (!summary.lastActivityAt || event.timestamp > summary.lastActivityAt) {
      summary.lastActivityAt = event.timestamp
    }

    switch (event.eventType) {
      case 'link_generated':
        summary.linkGeneratedCount += 1
        break
      case 'generator_opened':
        summary.generatorOpenedCount += 1
        break
      case 'session_verified':
        summary.sessionVerifiedCount += 1
        break
      case 'export_clicked':
        summary.exportClickedCount += 1
        break
      case 'export_succeeded':
        summary.exportSucceededCount += 1
        break
      case 'export_failed':
        summary.exportFailedCount += 1
        break
    }

    if (event.format) {
      increment(summary.formats, event.format)
      increment(formatUsage, event.format)
    }
  }

  const exhibitorSummaries = Array.from(exhibitorMap.values())
    .map((summary) => {
      summary.generatedLinkButNeverExported =
        summary.linkGeneratedCount > 0 && summary.exportSucceededCount === 0
      return summary
    })
    .sort((a, b) => {
      if (b.totalEvents !== a.totalEvents) {
        return b.totalEvents - a.totalEvents
      }
      return a.companyName.localeCompare(b.companyName)
    })

  const totalExportsSucceeded = exhibitorSummaries.reduce(
    (sum, item) => sum + item.exportSucceededCount,
    0
  )

  const totalExportsFailed = exhibitorSummaries.reduce(
    (sum, item) => sum + item.exportFailedCount,
    0
  )

  const totalGeneratorOpens = exhibitorSummaries.reduce(
    (sum, item) => sum + item.generatorOpenedCount,
    0
  )

  const appliedExhibitorId = options?.exhibitorId?.trim() || null
  const appliedExhibitorName = appliedExhibitorId
    ? availableExhibitors.find((item) => item.exhibitorId === appliedExhibitorId)
        ?.companyName ?? null
    : null

  const conversionRate = totalGeneratorOpens
    ? `${Math.round((totalExportsSucceeded / totalGeneratorOpens) * 100)}%`
    : '0%'

  return {
    totalEvents: events.length,
    totalExhibitors: exhibitorSummaries.length,
    totalExportsSucceeded,
    totalExportsFailed,
    formatUsage,
    exhibitorSummaries,
    recentEvents: events.slice(0, 100),
    dailySeries: buildDailySeries(events, {
      rangeDays: options?.rangeDays,
      startDate: options?.startDate,
      endDate: options?.endDate,
    }),
    availableExhibitors,
    appliedExhibitorId,
    appliedExhibitorName,
    appliedSearchQuery,
    appliedStartDate,
    appliedEndDate,
    totalGeneratorOpens,
    conversionRate,
    funnel: buildFunnelSummary(events),
  }
}