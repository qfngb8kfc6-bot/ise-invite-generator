import type { AnalyticsEventInput, ExportFormat } from './analytics-types'

type BrowserAnalyticsEventInput = Omit<
  AnalyticsEventInput,
  'timestamp' | 'environment'
>

export async function trackAnalyticsEvent(
  input: BrowserAnalyticsEventInput
): Promise<void> {
  try {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Analytics event request failed', {
        status: response.status,
        statusText: response.statusText,
        input,
      })
    }
  } catch (error) {
    console.error('Analytics event request failed', {
      error,
      input,
    })
  }
}

export async function withTrackedExport<T>(args: {
  exhibitorId: string
  companyName: string
  format: ExportFormat
  run: () => Promise<T>
}): Promise<T> {
  const { exhibitorId, companyName, format, run } = args

  await trackAnalyticsEvent({
    exhibitorId,
    companyName,
    eventType: 'export_clicked',
    format,
  })

  try {
    const result = await run()

    await trackAnalyticsEvent({
      exhibitorId,
      companyName,
      eventType: 'export_succeeded',
      format,
    })

    return result
  } catch (error) {
    await trackAnalyticsEvent({
      exhibitorId,
      companyName,
      eventType: 'export_failed',
      format,
      metadata: {
        message:
          error instanceof Error ? error.message.slice(0, 500) : 'Unknown error',
      },
    })

    throw error
  }
}