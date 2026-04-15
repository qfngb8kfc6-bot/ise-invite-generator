'use client'

import { useState } from 'react'

export default function LinkGeneratorPage() {
  const [exhibitorId, setExhibitorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<null | {
    token: string
    generatorUrl: string
  }>(null)

  async function handleGenerate() {
    if (!exhibitorId.trim()) {
      setError('Please enter an exhibitor ID')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/dev-token/${exhibitorId.trim()}`)

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to generate link')
      }

      setResult({
        token: data.token,
        generatorUrl: data.generatorUrl,
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl space-y-6">

        <div>
          <h1 className="text-3xl font-bold">Link Generator</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Generate secure invitation links for exhibitors.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">

          <div>
            <label className="block text-sm font-medium mb-2">
              Exhibitor ID
            </label>
            <input
              value={exhibitorId}
              onChange={(e) => setExhibitorId(e.target.value)}
              placeholder="e.g. 1001"
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Link'}
          </button>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 pt-4 border-t">

              <div>
                <div className="text-xs text-neutral-500 mb-1">Invitation Link</div>
                <div className="flex gap-2">
                  <input
                    value={result.generatorUrl}
                    readOnly
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(result.generatorUrl)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-neutral-100"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 mb-1">Token</div>
                <div className="flex gap-2">
                  <input
                    value={result.token}
                    readOnly
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(result.token)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-neutral-100"
                  >
                    Copy
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  )
}