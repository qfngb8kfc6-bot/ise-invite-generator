'use client'

import { useEffect, useState } from 'react'

type DownloadFormat = 'csv' | 'xlsx'

type ExportMeta = {
  ok: boolean
  showCode: string
  exhibitorDataSource: 'mys' | 'mock'
  allowMockFallback: boolean
  isLiveMys: boolean
  exhibitorCount: number
  error?: string
}

export default function AdminLinksPage() {
  const [activeFormat, setActiveFormat] = useState<DownloadFormat | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [metaError, setMetaError] = useState('')
  const [meta, setMeta] = useState<ExportMeta | null>(null)
  const [isMetaLoading, setIsMetaLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadMeta() {
      try {
        setIsMetaLoading(true)
        setMetaError('')

        const response = await fetch('/api/admin/launch-links/meta', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load export environment info')
        }

        const data = (await response.json()) as ExportMeta

        if (!isMounted) {
          return
        }

        setMeta(data)

        if (!data.ok && data.error) {
          setMetaError(data.error)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setMetaError(
          error instanceof Error
            ? error.message
            : 'Failed to load export environment info'
        )
      } finally {
        if (isMounted) {
          setIsMetaLoading(false)
        }
      }
    }

    loadMeta()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleDownload(format: DownloadFormat) {
    try {
      setActiveFormat(format)
      setError('')
      setSuccessMessage('')

      const response = await fetch(`/api/admin/launch-links?format=${format}`, {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        let message =
          format === 'xlsx'
            ? 'Failed to generate XLSX'
            : 'Failed to generate CSV'

        try {
          const data = await response.json()
          message = data?.error || message
        } catch {
          // ignore
        }

        throw new Error(message)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download =
        format === 'xlsx' ? 'ebo-launch-links.xlsx' : 'ebo-launch-links.csv'

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

      setSuccessMessage(
        format === 'xlsx'
          ? 'XLSX download started successfully.'
          : 'CSV download started successfully.'
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setActiveFormat(null)
    }
  }

  const isDownloadingCsv = activeFormat === 'csv'
  const isDownloadingXlsx = activeFormat === 'xlsx'
  const isLoading = activeFormat !== null

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bulk EBO Launch Link Generator
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Generate signed launch URLs directly from the live MYS exhibitor
            list and download them in spreadsheet format for admin use.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Export environment</h2>

          {isMetaLoading ? (
            <p className="mt-4 text-sm text-neutral-500">
              Loading export environment…
            </p>
          ) : metaError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {metaError}
            </div>
          ) : meta ? (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Show code
                  </div>
                  <div className="mt-2 text-lg font-semibold text-neutral-900">
                    {meta.showCode || 'Not set'}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Data source
                  </div>
                  <div className="mt-2 text-lg font-semibold text-neutral-900">
                    {meta.exhibitorDataSource}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Mock fallback
                  </div>
                  <div className="mt-2 text-lg font-semibold text-neutral-900">
                    {meta.allowMockFallback ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Export status
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                        meta.isLiveMys
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {meta.isLiveMys ? 'Live MYS dataset' : 'Not live-strict MYS'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Export preview
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-900">
                  {meta.exhibitorCount.toLocaleString()}
                </div>
                <p className="mt-1 text-sm text-blue-800">
                  exhibitors will be included in the next export.
                </p>
              </div>

              <p className="mt-4 text-sm text-neutral-500">
                This panel helps confirm that exports are being generated from
                the correct environment before downloading files for EBO use.
              </p>
            </>
          ) : null}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What this does</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            <li>• Calls MYS and loads the full exhibitor list</li>
            <li>• Fetches each exhibitor’s company name and stand number</li>
            <li>• Generates a signed launch URL for each exhibitor</li>
            <li>• Downloads one export ready for EBO or internal admin use</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Download export</h2>

          <p className="mt-2 text-sm text-neutral-600">
            XLSX is best for opening in spreadsheet apps. CSV is useful for
            imports and raw data workflows.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleDownload('xlsx')}
              disabled={isLoading}
              className="rounded-xl border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloadingXlsx ? 'Generating XLSX…' : 'Download XLSX'}
            </button>

            <button
              type="button"
              onClick={() => handleDownload('csv')}
              disabled={isLoading}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloadingCsv ? 'Generating CSV…' : 'Download CSV'}
            </button>
          </div>

          <p className="mt-4 text-sm text-neutral-500">
            The exported file contains: exhibitor ID, company name, stand
            number, and signed launch URL.
          </p>
        </section>
      </div>
    </main>
  )
}