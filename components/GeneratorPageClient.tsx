'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import InvitePreview from '@/components/InvitePreview'
import type { Exhibitor } from '@/lib/exhibitors'
import {
  exportPdf,
  exportPng,
  exportZipPack,
  makeExportBaseName,
  type ExportFormatKey,
} from '@/lib/export'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type SessionSuccess = {
  ok: true
  exhibitor: Exhibitor
}

type SessionFailure = {
  ok: false
  error: string
}

type SessionResponse = SessionSuccess | SessionFailure

type GeneratorPageClientProps = {
  initialToken: string
}

function isThemeKey(value: string): value is ThemeKey {
  return value in themes
}

function isLanguageKey(value: string): value is LanguageKey {
  return value in translations
}

function fallbackTheme(value: string): ThemeKey {
  return isThemeKey(value) ? value : 'audio'
}

function fallbackLanguage(value: string): LanguageKey {
  return isLanguageKey(value) ? value : 'en'
}

export default function GeneratorPageClient({
  initialToken,
}: GeneratorPageClientProps) {
  const previewRef = useRef<HTMLDivElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifiedExhibitor, setVerifiedExhibitor] = useState<Exhibitor | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [standNumber, setStandNumber] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [theme, setTheme] = useState<ThemeKey>('audio')
  const [language, setLanguage] = useState<LanguageKey>('en')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFileName, setLogoFileName] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      if (!initialToken) {
        setError('Missing token in URL')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
          body: JSON.stringify({ token: initialToken }),
        })

        const data = (await response.json()) as SessionResponse

        if (!response.ok || !data.ok) {
          throw new Error(data.ok ? 'Session request failed' : data.error)
        }

        if (!cancelled) {
          const exhibitor = data.exhibitor

          setVerifiedExhibitor(exhibitor)
          setCompanyName(exhibitor.companyName ?? '')
          setStandNumber(exhibitor.standNumber ?? '')
          setInvitationCode(exhibitor.invitationCode ?? '')
          setRegistrationUrl(exhibitor.registrationUrl ?? '')
          setTheme(fallbackTheme(exhibitor.theme))
          setLanguage(fallbackLanguage(exhibitor.language))
          setLogoUrl(exhibitor.logoUrl ?? '')
          setLogoFileName('')
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load exhibitor session'

        if (!cancelled) {
          setError(message)
          setVerifiedExhibitor(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [initialToken])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const nextUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextUrl

    setLogoUrl(nextUrl)
    setLogoFileName(file.name)
  }

  function resetToVerifiedValues() {
    if (!verifiedExhibitor) {
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    setCompanyName(verifiedExhibitor.companyName ?? '')
    setStandNumber(verifiedExhibitor.standNumber ?? '')
    setInvitationCode(verifiedExhibitor.invitationCode ?? '')
    setRegistrationUrl(verifiedExhibitor.registrationUrl ?? '')
    setTheme(fallbackTheme(verifiedExhibitor.theme))
    setLanguage(fallbackLanguage(verifiedExhibitor.language))
    setLogoUrl(verifiedExhibitor.logoUrl ?? '')
    setLogoFileName('')
    setExportError(null)
  }

  async function handlePngExport(format: ExportFormatKey) {
    if (!previewRef.current) {
      setExportError('Preview element not found')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, standNumber)
      await exportPng(previewRef.current, format, baseName)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'PNG export failed')
    } finally {
      setIsExporting(false)
    }
  }

  async function handlePdfExport() {
    if (!previewRef.current) {
      setExportError('Preview element not found')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, standNumber)
      await exportPdf(previewRef.current, baseName)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'PDF export failed')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleZipExport() {
    if (!previewRef.current) {
      setExportError('Preview element not found')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, standNumber)
      await exportZipPack(previewRef.current, baseName)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'ZIP export failed')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Loading exhibitor session...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-red-700">Session error</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </main>
    )
  }

  if (!verifiedExhibitor) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">No exhibitor loaded.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Exhibitor Invitation Generator
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Verified session loaded for{' '}
              <strong>{verifiedExhibitor.companyName}</strong> · Stand{' '}
              <strong>{verifiedExhibitor.standNumber}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetToVerifiedValues}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => handlePngExport('linkedin')}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              PNG LinkedIn
            </button>
            <button
              type="button"
              onClick={() => handlePngExport('square')}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              PNG Square
            </button>
            <button
              type="button"
              onClick={() => handlePngExport('email')}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              PNG Email
            </button>
            <button
              type="button"
              onClick={() => handlePngExport('print')}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              PNG Print
            </button>
            <button
              type="button"
              onClick={handlePdfExport}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              PDF
            </button>
            <button
              type="button"
              onClick={handleZipExport}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ZIP Pack
            </button>
          </div>
        </div>

        {exportError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {exportError}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Generator inputs</h2>
          <p className="mt-1 text-sm text-zinc-500">
            These values are prefilled from the verified exhibitor session.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-zinc-700">
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="standNumber" className="mb-2 block text-sm font-medium text-zinc-700">
                Stand number
              </label>
              <input
                id="standNumber"
                type="text"
                value={standNumber}
                onChange={(event) => setStandNumber(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="invitationCode" className="mb-2 block text-sm font-medium text-zinc-700">
                Invitation code
              </label>
              <input
                id="invitationCode"
                type="text"
                value={invitationCode}
                onChange={(event) => setInvitationCode(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="registrationUrl" className="mb-2 block text-sm font-medium text-zinc-700">
                Registration URL
              </label>
              <input
                id="registrationUrl"
                type="url"
                value={registrationUrl}
                onChange={(event) => setRegistrationUrl(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="logoUpload" className="mb-2 block text-sm font-medium text-zinc-700">
                Logo upload
              </label>
              <input
                id="logoUpload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
              />
              {logoFileName ? (
                <p className="mt-2 text-xs text-zinc-500">Selected: {logoFileName}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="theme" className="mb-2 block text-sm font-medium text-zinc-700">
                Theme
              </label>
              <select
                id="theme"
                value={theme}
                onChange={(event) => setTheme(event.target.value as ThemeKey)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              >
                {Object.keys(themes).map((key) => (
                  <option key={key} value={key}>
                    {themes[key as ThemeKey].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="mb-2 block text-sm font-medium text-zinc-700">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageKey)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              >
                {Object.keys(translations).map((key) => (
                  <option key={key} value={key}>
                    {key.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Verified source data</h3>
            <div className="mt-3 space-y-2 text-xs text-zinc-600">
              <p><strong>ID:</strong> {verifiedExhibitor.id}</p>
              <p><strong>Company:</strong> {verifiedExhibitor.companyName}</p>
              <p><strong>Stand:</strong> {verifiedExhibitor.standNumber}</p>
              <p><strong>Invitation code:</strong> {verifiedExhibitor.invitationCode}</p>
              <p className="break-all"><strong>Registration URL:</strong> {verifiedExhibitor.registrationUrl}</p>
              <p><strong>Theme:</strong> {verifiedExhibitor.theme}</p>
              <p><strong>Language:</strong> {verifiedExhibitor.language}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">Invitation preview</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Live preview using the verified session-backed generator data.
            </p>
          </div>

          <div className="overflow-auto rounded-2xl border border-zinc-200 bg-zinc-100 p-4">
            <div ref={previewRef} className="inline-block">
              <InvitePreview
                companyName={companyName}
                standNumber={standNumber}
                invitationCode={invitationCode}
                logoUrl={logoUrl}
                registrationUrl={registrationUrl}
                theme={theme}
                language={language}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}