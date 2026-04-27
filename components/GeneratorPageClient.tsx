'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import InvitePreview from '@/components/InvitePreview'
import LanguageSwitcher, {
  getStoredLanguage,
  setStoredLanguage,
} from '@/components/LanguageSwitcher'
import type { Exhibitor } from '@/lib/exhibitors'
import {
  exportPdf,
  exportPng,
  exportZipPack,
  makeExportBaseName,
  type ExportFormatKey,
} from '@/lib/export'
import { withTrackedExport } from '@/lib/analytics-client'
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

function mapPngFormatForAnalytics(format: ExportFormatKey) {
  switch (format) {
    case 'linkedin':
      return 'png-linkedin' as const
    case 'square':
      return 'png-square' as const
    case 'email':
      return 'png-email' as const
    case 'print':
      return 'png-print' as const
    default:
      return null
  }
}

function getBoothList(value?: string | null): string[] {
  if (!value) {
    return []
  }

  return value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeStandNumber(value?: string | null): string {
  return getBoothList(value).join(', ')
}

function hasMultipleBooths(value?: string | null): boolean {
  return getBoothList(value).length > 1
}

function getStandLabel(value?: string | null): string {
  return hasMultipleBooths(value) ? 'Booths' : 'Booth'
}

function getThemeBadgeClasses(theme: ThemeKey): string {
  switch (theme) {
    case 'lighting':
      return 'border-amber-400/40 bg-amber-500/10 text-amber-200'
    case 'residential':
      return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
    case 'audio':
    default:
      return 'border-blue-400/40 bg-blue-500/10 text-blue-200'
  }
}

function BoothBadges({
  standNumber,
  theme,
}: {
  standNumber?: string | null
  theme: ThemeKey
}) {
  const booths = getBoothList(standNumber)

  if (booths.length === 0) {
    return <span className="text-neutral-500">—</span>
  }

  const badgeClasses = getThemeBadgeClasses(theme)

  return (
    <div className="flex flex-wrap gap-2">
      {booths.map((booth) => (
        <span
          key={booth}
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses}`}
        >
          {booth}
        </span>
      ))}
    </div>
  )
}

function ShellCard({
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
    <label className="mb-2 block text-sm font-medium text-neutral-300">{children}</label>
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

function Select({
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-black/40 ${className}`}
    />
  )
}

function ActionButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'blue' | 'green'
}) {
  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-neutral-200'
      : variant === 'blue'
      ? 'bg-blue-600 text-white hover:bg-blue-500'
      : variant === 'green'
      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
      : variant === 'ghost'
      ? 'border border-white/10 bg-transparent text-neutral-300 hover:bg-white/5'
      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

function StatBox({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export default function GeneratorPageClient({
  initialToken,
}: GeneratorPageClientProps) {
  const exportPreviewRef = useRef<HTMLDivElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const copyMessageTimeoutRef = useRef<number | null>(null)

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
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false)

  const ui = translations[language].ui
  const displayStandNumber = normalizeStandNumber(standNumber)
  const verifiedDisplayStandNumber = normalizeStandNumber(
    verifiedExhibitor?.standNumber
  )

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      if (!initialToken) {
        setError(translations[getStoredLanguage()].ui.commonMissingTokenInUrl)
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
          const nextLanguage = fallbackLanguage(exhibitor.language)

          setVerifiedExhibitor(exhibitor)
          setCompanyName(exhibitor.companyName ?? '')
          setStandNumber(normalizeStandNumber(exhibitor.standNumber ?? ''))
          setInvitationCode(exhibitor.invitationCode ?? '')
          setRegistrationUrl(exhibitor.registrationUrl ?? '')
          setTheme(fallbackTheme(exhibitor.theme))
          setLanguage(nextLanguage)
          setStoredLanguage(nextLanguage)
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

      if (copyMessageTimeoutRef.current) {
        window.clearTimeout(copyMessageTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsFullPreviewOpen(false)
      }
    }

    if (isFullPreviewOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isFullPreviewOpen])

  function showCopyMessage(message: string) {
    setCopyMessage(message)

    if (copyMessageTimeoutRef.current) {
      window.clearTimeout(copyMessageTimeoutRef.current)
    }

    copyMessageTimeoutRef.current = window.setTimeout(() => {
      setCopyMessage(null)
      copyMessageTimeoutRef.current = null
    }, 2500)
  }

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value)
      showCopyMessage(successMessage)
    } catch {
      setExportError('Failed to copy to clipboard')
    }
  }

  function openRegistrationPage() {
    if (!registrationUrl.trim()) {
      setExportError('Registration URL is missing')
      return
    }

    window.open(registrationUrl, '_blank', 'noopener,noreferrer')
  }

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

    const nextLanguage = fallbackLanguage(verifiedExhibitor.language)

    setCompanyName(verifiedExhibitor.companyName ?? '')
    setStandNumber(normalizeStandNumber(verifiedExhibitor.standNumber ?? ''))
    setInvitationCode(verifiedExhibitor.invitationCode ?? '')
    setRegistrationUrl(verifiedExhibitor.registrationUrl ?? '')
    setTheme(fallbackTheme(verifiedExhibitor.theme))
    setLanguage(nextLanguage)
    setStoredLanguage(nextLanguage)
    setLogoUrl(verifiedExhibitor.logoUrl ?? '')
    setLogoFileName('')
    setExportError(null)
    setCopyMessage(null)
  }

  function getAnalyticsCompanyName() {
    return companyName.trim() || verifiedExhibitor?.companyName || 'Unknown Exhibitor'
  }

  async function handlePngExport(format: ExportFormatKey) {
    if (!exportPreviewRef.current) {
      setExportError('Preview element not found')
      return
    }

    if (!verifiedExhibitor) {
      setExportError('Verified exhibitor not found')
      return
    }

    const analyticsFormat = mapPngFormatForAnalytics(format)

    if (!analyticsFormat) {
      setExportError('Unsupported PNG export format')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, displayStandNumber)
      const previewElement = exportPreviewRef.current

      await withTrackedExport({
        exhibitorId: verifiedExhibitor.id,
        companyName: getAnalyticsCompanyName(),
        format: analyticsFormat,
        run: async () => {
          await exportPng(previewElement, format, baseName)
        },
      })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'PNG export failed')
    } finally {
      setIsExporting(false)
    }
  }

  async function handlePdfExport() {
    if (!exportPreviewRef.current) {
      setExportError('Preview element not found')
      return
    }

    if (!verifiedExhibitor) {
      setExportError('Verified exhibitor not found')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, displayStandNumber)
      const previewElement = exportPreviewRef.current

      await withTrackedExport({
        exhibitorId: verifiedExhibitor.id,
        companyName: getAnalyticsCompanyName(),
        format: 'pdf',
        run: async () => {
          await exportPdf(previewElement, baseName)
        },
      })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'PDF export failed')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleZipExport() {
    if (!exportPreviewRef.current) {
      setExportError('Preview element not found')
      return
    }

    if (!verifiedExhibitor) {
      setExportError('Verified exhibitor not found')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, displayStandNumber)
      const previewElement = exportPreviewRef.current

      await withTrackedExport({
        exhibitorId: verifiedExhibitor.id,
        companyName: getAnalyticsCompanyName(),
        format: 'zip',
        run: async () => {
          await exportZipPack(previewElement, baseName)
        },
      })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'ZIP export failed')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-sm text-neutral-300">{ui.commonLoadingSession}</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h1 className="text-lg font-semibold text-red-200">{ui.commonSessionError}</h1>
          <p className="mt-2 text-sm text-red-300">{error}</p>
        </div>
      </main>
    )
  }

  if (!verifiedExhibitor) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-sm text-neutral-300">{ui.commonNoExhibitorLoaded}</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                  Verified exhibitor session
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {ui.generatorTitle}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                  {ui.generatorVerifiedPrefix}{' '}
                  <strong className="text-white">{verifiedExhibitor.companyName}</strong>
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <StatBox label={getStandLabel(displayStandNumber)}>
                    <BoothBadges standNumber={displayStandNumber} theme={theme} />
                  </StatBox>

                  <StatBox label={ui.generatorInvitationCode}>
                    <div className="space-y-3">
                      <div className="break-all text-sm font-medium text-white">
                        {invitationCode || '—'}
                      </div>
                      {invitationCode ? (
                        <ActionButton
                          type="button"
                          onClick={() => copyText(invitationCode, 'Invitation code copied.')}
                          variant="ghost"
                          className="px-3 py-2 text-xs"
                        >
                          Copy
                        </ActionButton>
                      ) : null}
                    </div>
                  </StatBox>

                  <StatBox label={ui.generatorRegistrationUrl}>
                    <div className="space-y-3">
                      <div className="break-all text-sm text-neutral-300">
                        {registrationUrl || '—'}
                      </div>
                      {registrationUrl ? (
                        <div className="flex flex-wrap gap-2">
                          <ActionButton
                            type="button"
                            onClick={() =>
                              copyText(registrationUrl, 'Registration URL copied.')
                            }
                            variant="ghost"
                            className="px-3 py-2 text-xs"
                          >
                            Copy URL
                          </ActionButton>
                          <ActionButton
                            type="button"
                            onClick={openRegistrationPage}
                            variant="ghost"
                            className="px-3 py-2 text-xs"
                          >
                            Open URL
                          </ActionButton>
                        </div>
                      ) : null}
                    </div>
                  </StatBox>
                </div>
              </div>

              <div className="shrink-0 xl:w-[360px]">
                <div className="mb-3 flex justify-end">
                  <LanguageSwitcher value={language} onChange={setLanguage} />
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ActionButton
                      type="button"
                      onClick={resetToVerifiedValues}
                      variant="ghost"
                      className="sm:col-span-2"
                    >
                      {ui.generatorReset}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={() => handlePngExport('linkedin')}
                      disabled={isExporting}
                      variant="secondary"
                    >
                      {ui.generatorPngLinkedIn}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={() => handlePngExport('square')}
                      disabled={isExporting}
                      variant="secondary"
                    >
                      {ui.generatorPngSquare}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={() => handlePngExport('email')}
                      disabled={isExporting}
                      variant="secondary"
                    >
                      {ui.generatorPngEmail}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={() => handlePngExport('print')}
                      disabled={isExporting}
                      variant="secondary"
                    >
                      {ui.generatorPngPrint}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={handlePdfExport}
                      disabled={isExporting}
                      variant="blue"
                    >
                      {ui.generatorPdf}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={handleZipExport}
                      disabled={isExporting}
                      variant="green"
                    >
                      {ui.generatorZipPack}
                    </ActionButton>

                    <ActionButton
                      type="button"
                      onClick={() => setIsFullPreviewOpen(true)}
                      variant="primary"
                      className="sm:col-span-2"
                    >
                      Full Preview
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>

            {copyMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {copyMessage}
              </div>
            ) : null}

            {exportError ? (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {exportError}
              </div>
            ) : null}
          </header>

          <div className="grid items-start gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
            <ShellCard
              title={ui.generatorInputsTitle}
              description={ui.generatorInputsDescription}
            >
              <div className="space-y-5">
                <div>
                  <FieldLabel>{ui.generatorCompanyName}</FieldLabel>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel>
                    {hasMultipleBooths(standNumber) ? 'Booth Numbers' : ui.generatorStandNumber}
                  </FieldLabel>
                  <Input
                    id="standNumber"
                    type="text"
                    value={standNumber}
                    onChange={(event) => setStandNumber(event.target.value)}
                  />
                  {getBoothList(standNumber).length > 0 ? (
                    <div className="mt-3">
                      <BoothBadges standNumber={standNumber} theme={theme} />
                    </div>
                  ) : null}
                </div>

                <div>
                  <FieldLabel>{ui.generatorInvitationCode}</FieldLabel>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="invitationCode"
                      type="text"
                      value={invitationCode}
                      onChange={(event) => setInvitationCode(event.target.value)}
                      className="flex-1"
                    />
                    <ActionButton
                      type="button"
                      onClick={() => copyText(invitationCode, 'Invitation code copied.')}
                      variant="ghost"
                    >
                      Copy
                    </ActionButton>
                  </div>
                </div>

                <div>
                  <FieldLabel>{ui.generatorRegistrationUrl}</FieldLabel>
                  <div className="space-y-3">
                    <Input
                      id="registrationUrl"
                      type="url"
                      value={registrationUrl}
                      onChange={(event) => setRegistrationUrl(event.target.value)}
                    />
                    <div className="flex flex-wrap gap-3">
                      <ActionButton
                        type="button"
                        onClick={() => copyText(registrationUrl, 'Registration URL copied.')}
                        variant="ghost"
                      >
                        Copy URL
                      </ActionButton>
                      <ActionButton
                        type="button"
                        onClick={openRegistrationPage}
                        variant="ghost"
                      >
                        Open URL
                      </ActionButton>
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>{ui.generatorLogoUpload}</FieldLabel>
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="block w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
                  />
                  {logoFileName ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      {ui.generatorSelectedFile}: {logoFileName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <FieldLabel>{ui.generatorTheme}</FieldLabel>
                  <Select
                    id="theme"
                    value={theme}
                    onChange={(event) => setTheme(event.target.value as ThemeKey)}
                  >
                    {Object.keys(themes).map((key) => (
                      <option key={key} value={key} className="text-black">
                        {themes[key as ThemeKey].label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <FieldLabel>{ui.generatorLanguage}</FieldLabel>
                  <LanguageSwitcher value={language} onChange={setLanguage} />
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-sm font-semibold text-white">
                  {ui.generatorVerifiedSourceData}
                </h3>

                <div className="mt-4 space-y-4 text-sm text-neutral-300">
                  <StatBox label="ID">
                    <div className="font-mono text-sm text-white">
                      {verifiedExhibitor.id}
                    </div>
                  </StatBox>

                  <StatBox label={ui.generatorCompanyName}>
                    <div className="break-words text-sm font-medium text-white">
                      {verifiedExhibitor.companyName}
                    </div>
                  </StatBox>

                  <StatBox label={getStandLabel(verifiedDisplayStandNumber)}>
                    <BoothBadges standNumber={verifiedDisplayStandNumber} theme={theme} />
                  </StatBox>

                  <StatBox label={ui.generatorInvitationCode}>
                    <div className="space-y-3">
                      <div className="break-all text-sm font-medium text-white">
                        {verifiedExhibitor.invitationCode}
                      </div>
                      <ActionButton
                        type="button"
                        onClick={() =>
                          copyText(
                            verifiedExhibitor.invitationCode,
                            'Verified invitation code copied.'
                          )
                        }
                        variant="ghost"
                        className="px-3 py-2 text-xs"
                      >
                        Copy
                      </ActionButton>
                    </div>
                  </StatBox>

                  <StatBox label={ui.generatorRegistrationUrl}>
                    <div className="space-y-3">
                      <div className="break-all text-sm text-neutral-300">
                        {verifiedExhibitor.registrationUrl}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          type="button"
                          onClick={() =>
                            copyText(
                              verifiedExhibitor.registrationUrl,
                              'Verified registration URL copied.'
                            )
                          }
                          variant="ghost"
                          className="px-3 py-2 text-xs"
                        >
                          Copy URL
                        </ActionButton>
                        <ActionButton
                          type="button"
                          onClick={() =>
                            window.open(
                              verifiedExhibitor.registrationUrl,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                          variant="ghost"
                          className="px-3 py-2 text-xs"
                        >
                          Open URL
                        </ActionButton>
                      </div>
                    </div>
                  </StatBox>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <StatBox label={ui.generatorTheme}>
                      <div className="text-sm font-medium text-white">
                        {verifiedExhibitor.theme}
                      </div>
                    </StatBox>

                    <StatBox label={ui.generatorLanguage}>
                      <div className="text-sm font-medium text-white">
                        {verifiedExhibitor.language}
                      </div>
                    </StatBox>
                  </div>
                </div>
              </div>
            </ShellCard>

            <ShellCard
              title={ui.generatorPreviewTitle}
              description={ui.generatorPreviewDescription}
            >
              <div className="sticky top-6">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="overflow-auto rounded-2xl border border-white/10 bg-neutral-950 p-4">
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[760px] origin-top-left scale-[0.62] sm:scale-[0.68] lg:scale-[0.72]">
                        <InvitePreview
                          companyName={companyName}
                          standNumber={displayStandNumber}
                          invitationCode={invitationCode}
                          logoUrl={logoUrl}
                          registrationUrl={registrationUrl}
                          theme={theme}
                          language={language}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton
                      type="button"
                      onClick={() => setIsFullPreviewOpen(true)}
                      variant="primary"
                    >
                      Open Full Preview
                    </ActionButton>
                  </div>
                </div>
              </div>
            </ShellCard>
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute -left-[99999px] top-0">
        <div ref={exportPreviewRef}>
          <InvitePreview
            companyName={companyName}
            standNumber={displayStandNumber}
            invitationCode={invitationCode}
            logoUrl={logoUrl}
            registrationUrl={registrationUrl}
            theme={theme}
            language={language}
          />
        </div>
      </div>

      {isFullPreviewOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[95vh] w-full max-w-[1320px] rounded-3xl border border-white/10 bg-[#0b0b0b] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Full Invitation Preview</h3>
                <p className="text-sm text-neutral-400">
                  Full-size view of the current invitation.
                </p>
              </div>

              <ActionButton
                type="button"
                onClick={() => setIsFullPreviewOpen(false)}
                variant="ghost"
              >
                Close
              </ActionButton>
            </div>

            <div className="max-h-[calc(95vh-96px)] overflow-auto rounded-2xl border border-white/10 bg-black p-4">
              <InvitePreview
                companyName={companyName}
                standNumber={displayStandNumber}
                invitationCode={invitationCode}
                logoUrl={logoUrl}
                registrationUrl={registrationUrl}
                theme={theme}
                language={language}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}