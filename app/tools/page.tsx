'use client'

import { useMemo, useState } from 'react'

type GeneratedLink = {
  exhibitorId: string
  launchUrl: string
  createdAt: string
  companyName?: string
  standNumber?: string
}

type BulkRow = {
  exhibitorId: string
  status: 'success' | 'error'
  launchUrl?: string
  error?: string
  createdAt: string
  companyName?: string
  standNumber?: string
}

type ExhibitorLookupResult = {
  exhibitorId: string
  companyName: string
  registrationUrl?: string | null
  standNumber?: string | null
}

const DEFAULT_MOCK_EXHIBITOR_IDS = ['1001', '1002', '1003']

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function downloadCsv(filename: string, rows: string[][]) {
  const escapeCell = (value: string) => {
    const normalized = value ?? ''
    if (
      normalized.includes(',') ||
      normalized.includes('"') ||
      normalized.includes('\n')
    ) {
      return `"${normalized.replace(/"/g, '""')}"`
    }
    return normalized
  }

  const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function parseExhibitorResponse(data: any): ExhibitorLookupResult | null {
  const source = data?.exhibitor ?? data?.item ?? data?.data ?? data

  const exhibitorId =
    source?.id ?? source?.exhibitorId ?? source?.exhibitor_id

  const companyName =
    source?.companyName ?? source?.company_name ?? source?.name

  if (!exhibitorId || !companyName) {
    return null
  }

  return {
    exhibitorId: String(exhibitorId),
    companyName: String(companyName),
    registrationUrl:
      source?.registrationUrl ?? source?.registration_url ?? null,
    standNumber: source?.standNumber ?? source?.stand_number ?? null,
  }
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </label>
  )
}

function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/20 focus:bg-black/40 ${className}`}
    />
  )
}

function Textarea({
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/20 focus:bg-black/40 ${className}`}
    />
  )
}

function ActionButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-neutral-200'
      : variant === 'ghost'
      ? 'bg-transparent text-neutral-300 hover:bg-white/5 border border-white/10'
      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

function InfoItem({
  label,
  value,
  mono = false,
  wrap = false,
}: {
  label: string
  value: string
  mono?: boolean
  wrap?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </div>
      <div
        className={`mt-2 text-sm text-white ${
          mono ? 'font-mono' : ''
        } ${wrap ? 'break-all' : ''}`}
      >
        {value || '—'}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const [exhibitorId, setExhibitorId] = useState('1001')
  const [bulkInput, setBulkInput] = useState('1001\n1002')
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [loadingBulk, setLoadingBulk] = useState(false)
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GeneratedLink | null>(null)
  const [history, setHistory] = useState<GeneratedLink[]>([])
  const [bulkResults, setBulkResults] = useState<BulkRow[]>([])
  const [lookupResult, setLookupResult] = useState<ExhibitorLookupResult | null>(null)

  async function requestLaunchLink(id: string) {
    const res = await fetch(`/api/internal-launch-link/${encodeURIComponent(id)}`)
    const data = await res.json()

    if (!res.ok || !data.ok) {
      throw new Error(data.error || `Failed to generate launch link for ${id}`)
    }

    return {
      exhibitorId: data.exhibitorId as string,
      launchUrl: data.launchUrl as string,
      companyName: (data.companyName as string | undefined) ?? undefined,
      standNumber: (data.standNumber as string | undefined) ?? undefined,
      createdAt: new Date().toISOString(),
    }
  }

  async function handleLookupExhibitor() {
    const id = exhibitorId.trim()

    if (!id) {
      setError('Please enter an exhibitor ID to look up')
      return
    }

    setLoadingLookup(true)
    setError('')
    setLookupResult(null)

    try {
      const res = await fetch(`/api/exhibitor/${encodeURIComponent(id)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Failed to find exhibitor ${id}`)
      }

      const parsed = parseExhibitorResponse(data)

      if (!parsed) {
        throw new Error('Exhibitor data was returned in an unexpected format')
      }

      setLookupResult(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to look up exhibitor')
    } finally {
      setLoadingLookup(false)
    }
  }

  async function handleGenerateSingle() {
    const id = exhibitorId.trim()

    if (!id) {
      setError('Please enter an exhibitor ID')
      return
    }

    setLoadingSingle(true)
    setError('')

    try {
      const newLink = await requestLaunchLink(id)
      setResult(newLink)
      setHistory((prev) => [newLink, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoadingSingle(false)
    }
  }

  async function runBulk(ids: string[]) {
    setLoadingBulk(true)
    setError('')
    setBulkResults([])

    const results: BulkRow[] = []
    const successfulLinks: GeneratedLink[] = []

    for (const id of ids) {
      try {
        const newLink = await requestLaunchLink(id)

        results.push({
          exhibitorId: newLink.exhibitorId,
          status: 'success',
          launchUrl: newLink.launchUrl,
          createdAt: newLink.createdAt,
          companyName: newLink.companyName,
          standNumber: newLink.standNumber,
        })

        successfulLinks.push(newLink)
      } catch (err) {
        results.push({
          exhibitorId: id,
          status: 'error',
          error:
            err instanceof Error ? err.message : 'Failed to generate launch link',
          createdAt: new Date().toISOString(),
        })
      }
    }

    setBulkResults(results)

    if (successfulLinks.length > 0) {
      setHistory((prev) => [...successfulLinks.reverse(), ...prev])
      setResult(successfulLinks[successfulLinks.length - 1])
    }

    setLoadingBulk(false)
  }

  async function handleGenerateBulk() {
    const ids = Array.from(
      new Set(
        bulkInput
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => value.split(' - ')[0].trim())
      )
    )

    if (ids.length === 0) {
      setError('Please enter at least one exhibitor ID for bulk generation')
      return
    }

    await runBulk(ids)
  }

  async function handleGenerateAllMock() {
    await runBulk(DEFAULT_MOCK_EXHIBITOR_IDS)
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  function openLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleExportCsv() {
    const rows: string[][] = [
      ['Exhibitor ID', 'Company Name', 'Stand Number', 'Status', 'Launch URL', 'Error', 'Created At'],
      ...bulkResults.map((item) => [
        item.exhibitorId,
        item.companyName ?? '',
        item.standNumber ?? '',
        item.status,
        item.launchUrl ?? '',
        item.error ?? '',
        item.createdAt,
      ]),
    ]

    downloadCsv('ebo-launch-links.csv', rows)
  }

  function handleExportHistoryCsv() {
    const rows: string[][] = [
      ['Exhibitor ID', 'Company Name', 'Stand Number', 'Launch URL', 'Created At'],
      ...history.map((item) => [
        item.exhibitorId,
        item.companyName ?? '',
        item.standNumber ?? '',
        item.launchUrl,
        item.createdAt,
      ]),
    ]

    downloadCsv('launch-link-history.csv', rows)
  }

  function handleClearBulkResults() {
    setBulkResults([])
  }

  function handleClearHistory() {
    setHistory([])
    setResult(null)
  }

  function handleQuickAddToBulk() {
    if (!lookupResult) return

    const line = `${lookupResult.exhibitorId} - ${lookupResult.companyName}`

    setBulkInput((prev) => {
      const current = prev.trim()
      if (!current) return line

      const lines = current.split(/\r?\n/).map((value) => value.trim())
      const alreadyExists = lines.some(
        (value) =>
          value === line ||
          value === lookupResult.exhibitorId ||
          value.startsWith(`${lookupResult.exhibitorId} - `)
      )

      if (alreadyExists) {
        return prev
      }

      return `${prev.trim()}\n${line}`
    })
  }

  const bulkSummary = useMemo(() => {
    const successCount = bulkResults.filter((item) => item.status === 'success').length
    const errorCount = bulkResults.filter((item) => item.status === 'error').length

    return {
      successCount,
      errorCount,
      total: bulkResults.length,
    }
  }, [bulkResults])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                Internal tools
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Invite Link Generator
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                Clean internal workspace for exhibitor lookup, launch-link generation,
                bulk processing, and quick exports.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Latest lookup
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {lookupResult?.exhibitorId ?? '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Bulk results
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {bulkSummary.total}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  Session history
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {history.length}
                </div>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Single exhibitor"
            description="Look up an exhibitor, inspect the returned data, then generate a launch link."
          >
            <div className="space-y-5">
              <div>
                <FieldLabel>Exhibitor ID</FieldLabel>
                <Input
                  value={exhibitorId}
                  onChange={(e) => setExhibitorId(e.target.value)}
                  placeholder="e.g. 1001"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={handleLookupExhibitor}
                  disabled={loadingLookup}
                  variant="secondary"
                >
                  {loadingLookup ? 'Looking up...' : 'Lookup Exhibitor'}
                </ActionButton>

                <ActionButton
                  onClick={handleGenerateSingle}
                  disabled={loadingSingle}
                  variant="primary"
                >
                  {loadingSingle ? 'Generating...' : 'Generate Launch Link'}
                </ActionButton>
              </div>

              {lookupResult ? (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem label="Company Name" value={lookupResult.companyName} />
                        <InfoItem label="Exhibitor ID" value={lookupResult.exhibitorId} mono />
                        <InfoItem
                          label="Booth / Stand"
                          value={lookupResult.standNumber ?? '—'}
                        />
                        <InfoItem
                          label="Registration URL"
                          value={lookupResult.registrationUrl ?? '—'}
                          wrap
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3 xl:w-[220px] xl:flex-col">
                      <ActionButton
                        onClick={handleQuickAddToBulk}
                        variant="secondary"
                        className="w-full"
                      >
                        Add to Bulk List
                      </ActionButton>
                      <ActionButton
                        onClick={() => setExhibitorId(lookupResult.exhibitorId)}
                        variant="ghost"
                        className="w-full"
                      >
                        Use This ID
                      </ActionButton>
                      {lookupResult.registrationUrl ? (
                        <>
                          <ActionButton
                            onClick={() => copy(lookupResult.registrationUrl!)}
                            variant="ghost"
                            className="w-full"
                          >
                            Copy Registration URL
                          </ActionButton>
                          <ActionButton
                            onClick={() => openLink(lookupResult.registrationUrl!)}
                            variant="ghost"
                            className="w-full"
                          >
                            Open Registration URL
                          </ActionButton>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title="Bulk generation"
            description="Paste one exhibitor ID per line, or separate IDs with commas."
          >
            <div className="space-y-5">
              <div>
                <FieldLabel>Exhibitor IDs</FieldLabel>
                <Textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows={10}
                  placeholder={'1001\n1002\n1003'}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={handleGenerateBulk}
                  disabled={loadingBulk}
                  variant="primary"
                >
                  {loadingBulk ? 'Generating Bulk Links...' : 'Generate Bulk Links'}
                </ActionButton>

                <ActionButton
                  onClick={handleGenerateAllMock}
                  disabled={loadingBulk}
                  type="button"
                  variant="secondary"
                >
                  Generate All Mock Exhibitors
                </ActionButton>

                <ActionButton
                  onClick={() => setBulkInput('')}
                  type="button"
                  variant="ghost"
                >
                  Clear Input
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        </div>

        {result ? (
          <SectionCard
            title="Latest generated launch link"
            description="Most recent successful launch link generated in this session."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <InfoItem label="Exhibitor ID" value={result.exhibitorId} mono />
              <InfoItem label="Company Name" value={result.companyName ?? '—'} />
              <InfoItem label="Stand Number" value={result.standNumber ?? '—'} />
              <InfoItem label="Created At" value={formatTimestamp(result.createdAt)} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Launch URL
              </div>
              <div className="mt-2 break-all font-mono text-sm text-white">
                {result.launchUrl}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <ActionButton onClick={() => copy(result.launchUrl)} variant="secondary">
                  Copy
                </ActionButton>
                <ActionButton onClick={() => openLink(result.launchUrl)} variant="ghost">
                  Open
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {bulkResults.length > 0 ? (
          <SectionCard
            title="Bulk generation results"
            description={`${bulkSummary.successCount} successful, ${bulkSummary.errorCount} failed, ${bulkSummary.total} total.`}
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={handleExportCsv} variant="secondary">
                  Export CSV
                </ActionButton>
                <ActionButton onClick={handleClearBulkResults} variant="ghost">
                  Clear Results
                </ActionButton>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse text-sm">
                  <thead className="bg-white/[0.04] text-left text-neutral-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">Exhibitor ID</th>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Stand</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Launch URL</th>
                      <th className="px-4 py-3 font-medium">Error</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((item) => (
                      <tr
                        key={`${item.exhibitorId}-${item.createdAt}`}
                        className="border-t border-white/5 align-top"
                      >
                        <td className="px-4 py-4 font-mono text-white">{item.exhibitorId}</td>
                        <td className="px-4 py-4 text-neutral-300">{item.companyName ?? '—'}</td>
                        <td className="px-4 py-4 text-neutral-300">{item.standNumber ?? '—'}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.status === 'success'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-red-500/15 text-red-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-neutral-300">
                          <div className="max-w-[320px] break-all">
                            {item.launchUrl ?? '—'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-red-300">
                          <div className="max-w-[260px] break-words">{item.error ?? '—'}</div>
                        </td>
                        <td className="px-4 py-4">
                          {item.launchUrl ? (
                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                onClick={() => copy(item.launchUrl!)}
                                variant="secondary"
                                className="px-3 py-2 text-xs"
                              >
                                Copy
                              </ActionButton>
                              <ActionButton
                                onClick={() => openLink(item.launchUrl!)}
                                variant="ghost"
                                className="px-3 py-2 text-xs"
                              >
                                Open
                              </ActionButton>
                            </div>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {history.length > 0 ? (
          <SectionCard
            title="Recent generated links"
            description="Most recent launch links generated in this browser session."
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div />
              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={handleExportHistoryCsv} variant="secondary">
                  Export History CSV
                </ActionButton>
                <ActionButton onClick={handleClearHistory} variant="ghost">
                  Clear History
                </ActionButton>
              </div>
            </div>

            <div className="grid gap-4">
              {history.map((item) => (
                <div
                  key={`${item.exhibitorId}-${item.createdAt}-${item.launchUrl.slice(0, 8)}`}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-white">
                        {item.companyName
                          ? `${item.companyName} (${item.exhibitorId})`
                          : item.exhibitorId}
                      </div>

                      {item.standNumber ? (
                        <div className="mt-1 text-sm text-neutral-400">
                          Stand: {item.standNumber}
                        </div>
                      ) : null}

                      <div className="mt-3 break-all font-mono text-sm text-neutral-300">
                        {item.launchUrl}
                      </div>

                      <div className="mt-3 text-xs uppercase tracking-[0.14em] text-neutral-500">
                        {formatTimestamp(item.createdAt)}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <ActionButton
                        onClick={() => copy(item.launchUrl)}
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                      >
                        Copy Link
                      </ActionButton>
                      <ActionButton
                        onClick={() => openLink(item.launchUrl)}
                        variant="ghost"
                        className="px-3 py-2 text-xs"
                      >
                        Open Link
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </main>
  )
}