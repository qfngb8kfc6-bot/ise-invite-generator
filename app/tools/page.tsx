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
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Internal Invite Link Generator</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Generate production-ready launch links for exhibitors, individually or in bulk.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div>
              <h2 className="text-xl font-semibold">Single launch link</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Look up an exhibitor first, then generate the EBO-ready launch URL.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">Exhibitor ID</label>
              <input
                value={exhibitorId}
                onChange={(e) => setExhibitorId(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                placeholder="e.g. 1001"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLookupExhibitor}
                disabled={loadingLookup}
                className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {loadingLookup ? 'Looking up...' : 'Lookup Exhibitor'}
              </button>

              <button
                onClick={handleGenerateSingle}
                disabled={loadingSingle}
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
              >
                {loadingSingle ? 'Generating...' : 'Generate Launch Link'}
              </button>
            </div>

            {lookupResult ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs text-neutral-400">Company Name</div>
                    <div className="mt-1 text-lg font-medium text-white">
                      {lookupResult.companyName}
                    </div>

                    <div className="mt-3 text-xs text-neutral-400">Exhibitor ID</div>
                    <div className="mt-1 text-sm text-neutral-300">
                      {lookupResult.exhibitorId}
                    </div>

                    {lookupResult.standNumber ? (
                      <>
                        <div className="mt-3 text-xs text-neutral-400">Stand Number</div>
                        <div className="mt-1 text-sm text-neutral-300">
                          {lookupResult.standNumber}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleQuickAddToBulk}
                      className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium transition hover:bg-neutral-800"
                    >
                      Add to Bulk List
                    </button>
                    <button
                      onClick={() => setExhibitorId(lookupResult.exhibitorId)}
                      className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium transition hover:bg-neutral-800"
                    >
                      Use This ID
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div>
              <h2 className="text-xl font-semibold">Bulk launch links</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Paste one exhibitor ID per line or separate IDs with commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">Exhibitor IDs</label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                placeholder={'1001\n1002\n1003'}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateBulk}
                disabled={loadingBulk}
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
              >
                {loadingBulk ? 'Generating Bulk Links...' : 'Generate Bulk Links'}
              </button>

              <button
                onClick={handleGenerateAllMock}
                disabled={loadingBulk}
                type="button"
                className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
              >
                Generate All Mock Exhibitors
              </button>

              <button
                onClick={() => setBulkInput('')}
                type="button"
                className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
              >
                Clear Input
              </button>
            </div>
          </div>
        </section>

        {result ? (
          <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Latest generated launch link</h2>

            <div>
              <div className="mb-1 text-xs text-neutral-400">Exhibitor ID</div>
              <input
                value={result.exhibitorId}
                readOnly
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              />
            </div>

            {result.companyName ? (
              <div>
                <div className="mb-1 text-xs text-neutral-400">Company Name</div>
                <input
                  value={result.companyName}
                  readOnly
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
            ) : null}

            {result.standNumber ? (
              <div>
                <div className="mb-1 text-xs text-neutral-400">Stand Number</div>
                <input
                  value={result.standNumber}
                  readOnly
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
            ) : null}

            <div>
              <div className="mb-1 text-xs text-neutral-400">Launch URL</div>
              <div className="flex gap-2">
                <input
                  value={result.launchUrl}
                  readOnly
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => copy(result.launchUrl)}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-xs transition hover:bg-neutral-800"
                >
                  Copy
                </button>
                <button
                  onClick={() => openLink(result.launchUrl)}
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-xs transition hover:bg-neutral-800"
                >
                  Open
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-neutral-400">Created At</div>
              <input
                value={formatTimestamp(result.createdAt)}
                readOnly
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              />
            </div>
          </section>
        ) : null}

        {bulkResults.length > 0 ? (
          <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Bulk generation results</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {bulkSummary.successCount} successful, {bulkSummary.errorCount} failed, {bulkSummary.total} total.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportCsv}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:bg-neutral-800"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleClearBulkResults}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:bg-neutral-800"
                >
                  Clear Results
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left">
                    <th className="py-3 pr-4 font-medium">Exhibitor ID</th>
                    <th className="py-3 pr-4 font-medium">Company</th>
                    <th className="py-3 pr-4 font-medium">Stand</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Launch URL</th>
                    <th className="py-3 pr-4 font-medium">Error</th>
                    <th className="py-3 pr-0 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((item) => (
                    <tr
                      key={`${item.exhibitorId}-${item.createdAt}`}
                      className="border-b border-neutral-900 align-top last:border-b-0"
                    >
                      <td className="py-3 pr-4">{item.exhibitorId}</td>
                      <td className="py-3 pr-4 text-neutral-300">{item.companyName ?? '—'}</td>
                      <td className="py-3 pr-4 text-neutral-300">{item.standNumber ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            item.status === 'success'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 break-all text-neutral-300">
                        {item.launchUrl ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-red-300">{item.error ?? '—'}</td>
                      <td className="py-3 pr-0">
                        {item.launchUrl ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => copy(item.launchUrl!)}
                              className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium transition hover:bg-neutral-800"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => openLink(item.launchUrl!)}
                              className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium transition hover:bg-neutral-800"
                            >
                              Open
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {history.length > 0 ? (
          <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent generated links</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Most recent launch links generated in this browser session.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportHistoryCsv}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:bg-neutral-800"
                >
                  Export History CSV
                </button>
                <button
                  onClick={handleClearHistory}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:bg-neutral-800"
                >
                  Clear History
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={`${item.exhibitorId}-${item.createdAt}-${item.launchUrl.slice(0, 8)}`}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white">
                        {item.companyName
                          ? `${item.companyName} (${item.exhibitorId})`
                          : item.exhibitorId}
                      </div>
                      {item.standNumber ? (
                        <div className="mt-1 text-xs text-neutral-500">
                          Stand: {item.standNumber}
                        </div>
                      ) : null}
                      <div className="mt-1 break-all text-sm text-neutral-400">
                        {item.launchUrl}
                      </div>
                      <div className="mt-2 text-xs text-neutral-500">
                        {formatTimestamp(item.createdAt)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copy(item.launchUrl)}
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium transition hover:bg-neutral-800"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => openLink(item.launchUrl)}
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium transition hover:bg-neutral-800"
                      >
                        Open Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}