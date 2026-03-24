'use client'

import { FormEvent, useState } from 'react'

type TokenResponse =
  | {
      ok: true
      exhibitorId: string
      token: string
      tokenLength: number
      generatorUrl: string
    }
  | {
      ok: false
      error: string
    }

export default function ToolsPage() {
  const [exhibitorId, setExhibitorId] = useState('1001')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TokenResponse | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedId = exhibitorId.trim()
    if (!trimmedId) {
      setError('Please enter an exhibitor ID')
      setResult(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch(`/api/dev-token/${encodeURIComponent(trimmedId)}`, {
        method: 'GET',
        cache: 'no-store',
      })

      const data = (await response.json()) as TokenResponse
      setResult(data)

      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? 'Failed to generate invite link' : data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invite link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
          <h1 className="text-3xl font-semibold text-white">Internal Invite Link Generator</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Use this page in local development to generate a signed generator link for an exhibitor.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label htmlFor="exhibitorId" className="mb-2 block text-sm font-medium text-zinc-300">
              Exhibitor ID
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="exhibitorId"
                type="text"
                value={exhibitorId}
                onChange={(event) => setExhibitorId(event.target.value)}
                placeholder="1001"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4">
              <h2 className="text-sm font-semibold text-red-300">Error</h2>
              <p className="mt-1 text-sm text-red-200">{error}</p>
            </div>
          ) : null}

          {result?.ok ? (
            <div className="mt-6 rounded-2xl border border-emerald-900 bg-emerald-950/30 p-5">
              <h2 className="text-sm font-semibold text-emerald-300">Invite link generated</h2>

              <div className="mt-4 space-y-3 text-sm text-zinc-200">
                <div>
                  <span className="font-medium text-zinc-400">Exhibitor ID:</span>{' '}
                  {result.exhibitorId}
                </div>

                <div>
                  <span className="font-medium text-zinc-400">Token length:</span>{' '}
                  {result.tokenLength}
                </div>

                <div>
                  <span className="font-medium text-zinc-400">Generator URL:</span>
                  <div className="mt-2 break-all rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-300">
                    {result.generatorUrl}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={result.generatorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
                  >
                    Open Generator
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(result.generatorUrl)
                    }}
                    className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-semibold text-zinc-300">Quick test IDs</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {['1001', '1002', '1003'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setExhibitorId(id)}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}