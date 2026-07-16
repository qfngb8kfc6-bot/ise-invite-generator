'use client'

import { useEffect, useRef, useState } from 'react'
import EmailBannerPreview from '@/components/EmailBannerPreview'
import InvitePreview from '@/components/InvitePreview'
import LinkedInInvitePreview from '@/components/LinkedInInvitePreview'
import {
  exportPdf,
  exportPng,
  exportZipPack,
  makeExportBaseName,
  type ExportFormatKey,
} from '@/lib/export'
import {
  trackAnalyticsEvent,
  withTrackedExport,
} from '@/lib/analytics-client'
import type { ExportFormat } from '@/lib/analytics-types'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { EditableInviteData, LanguageKey, ThemeKey } from '@/lib/types'

type SecondaryGeneratorPageClientProps = {
  data: EditableInviteData & {
    requestId: string
    assignedCodeId: string
    status: string
  }
}

const orderedThemeKeys: ThemeKey[] = [
  'audio',
  'contentProduction',
  'digitalSignage',
  'educationTechnology',
  'iseBrandingOne',
  'lighting',
  'unifiedCommunications',
  'residential',
  'iseBrandingTwo',
  'smartBuilding',
]

function normalizeInitialLogoUrl(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) return ''

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed
  }

  return ''
}

export default function SecondaryGeneratorPageClient({
  data,
}: SecondaryGeneratorPageClientProps) {
  const exportPreviewRef = useRef<HTMLDivElement | null>(null)
  const emailBannerExportRef = useRef<HTMLDivElement | null>(null)
  const linkedinExportRef = useRef<HTMLDivElement | null>(null)

  const [companyName, setCompanyName] = useState(data.companyName)
  const [logoUrl, setLogoUrl] = useState(() =>
    normalizeInitialLogoUrl(data.logoUrl)
  )
  const [logoMessage, setLogoMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeKey>(data.theme)
  const [cardLanguage, setCardLanguage] = useState<LanguageKey>(data.language)

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showDownloadPanel, setShowDownloadPanel] = useState(false)

  const invitationId = data.assignedCodeId
  const invitationCode = data.invitationCode
  const registrationUrl = data.registrationUrl
  const analyticsExhibitorId = `secondary:${data.requestId}`

  useEffect(() => {
    void trackAnalyticsEvent({
      exhibitorId: analyticsExhibitorId,
      companyName: data.companyName || 'Secondary invitation request',
      eventType: 'generator_opened',
      metadata: {
        flow: 'secondary',
        requestId: data.requestId,
        invitationId: data.assignedCodeId || null,
        invitationCode: data.invitationCode || null,
      },
    })
  }, [
    analyticsExhibitorId,
    data.assignedCodeId,
    data.companyName,
    data.invitationCode,
    data.requestId,
  ])

  function getAnalyticsFormat(type: 'pdf' | 'zip' | ExportFormatKey): ExportFormat {
    if (type === 'pdf') return 'pdf'
    if (type === 'zip') return 'zip'
    if (type === 'linkedin') return 'png-linkedin'
    if (type === 'email') return 'png-email'
    if (type === 'square') return 'png-square'
    if (type === 'print') return 'png-print'

    return null
  }

  function handleLogoUpload(file: File | null) {
    setLogoMessage(null)

    if (!file) return

    const maxSizeMb = 3
    const maxSizeBytes = maxSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      setLogoMessage(`Logo is too large. Maximum size is ${maxSizeMb}MB.`)
      return
    }

    if (!file.type.startsWith('image/')) {
      setLogoMessage('Please upload a valid image file.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const image = new Image()

      image.onload = () => {
        if (image.width < 300 || image.height < 120) {
          setLogoMessage(
            'Logo uploaded, but recommended minimum size is 300 × 120px for best export quality.'
          )
        }

        setLogoUrl(result)
      }

      image.onerror = () => {
        setLogoMessage('Could not read this logo image.')
      }

      image.src = result
    }

    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoUrl('')
    setLogoMessage(null)
  }

  async function runExport(type: 'pdf' | 'zip' | ExportFormatKey) {
    const exportNode =
      type === 'email'
        ? emailBannerExportRef.current
        : type === 'square'
          ? exportPreviewRef.current
          : type === 'linkedin'
            ? linkedinExportRef.current
            : exportPreviewRef.current

    if (!exportNode) {
      setExportError('Preview element not found.')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, invitationCode)
      const analyticsFormat = getAnalyticsFormat(type)

      await withTrackedExport({
        exhibitorId: analyticsExhibitorId,
        companyName: companyName || data.companyName || 'Secondary invitation request',
        format: analyticsFormat,
        run: async () => {
          if (type === 'pdf') {
            await exportPdf(exportNode, baseName)
            return
          }

          if (type === 'zip') {
            await exportZipPack(
              exportPreviewRef.current || exportNode,
              baseName,
              emailBannerExportRef.current || undefined,
              exportPreviewRef.current || undefined,
              linkedinExportRef.current || undefined
            )
            return
          }

          await exportPng(exportNode, type, baseName)
        },
      })
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed.')
    } finally {
      setIsExporting(false)
    }
  }

  const inputClassName =
    'w-full rounded-[18px] border border-white/10 bg-white/[0.075] px-4 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10'

  const labelClassName = 'mb-2 block text-sm font-medium text-white/70'

  const helperClassName = 'text-sm text-white/52'

  const panelClassName =
    'rounded-[22px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl'

  const detailCardClassName =
    'rounded-2xl border border-white/10 bg-white/[0.04] p-4'

  const secondaryButtonClassName =
    'rounded-2xl border border-green-300/10 bg-[#2f6f3e] py-3 font-semibold text-white transition hover:bg-[#285f35] disabled:opacity-50'

  return (
    <main className="h-[calc(100vh-128px)] overflow-hidden bg-transparent text-white">
      <div className="grid h-full lg:grid-cols-[500px_1fr]">
        <aside className="relative flex h-full min-h-0 flex-col border-r border-white/10 bg-white/[0.075] shadow-[22px_0_70px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
          <div className="shrink-0 border-b border-white/10 px-7 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
              Secondary invitation generator
            </p>
            <p className={`mt-2 leading-6 ${helperClassName}`}>
              These values have been loaded from an approved invitation request. You can change the logo, language and theme before downloading.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-6">
            <div className="space-y-5">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <h2 className="text-xl font-semibold">Invitation details</h2>
                <p className={`mt-1 ${helperClassName}`}>
                  Review the approved details that will appear on the invitation card.
                </p>

                <div className="mt-4 rounded-2xl border border-blue-400/20 bg-black/28 px-4 py-3 text-xs text-blue-100">
                  Request {data.requestId} loaded from Google Sheets.
                </div>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className={labelClassName}>Company name</span>
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      className={inputClassName}
                    />
                  </label>

                  <div className={panelClassName}>
                    <div>
                      <p className="text-sm font-semibold">
                        Assigned by the ISE team
                      </p>
                      <p className={`mt-1 text-xs ${helperClassName}`}>
                        These values are controlled from the secondary invitation spreadsheet.
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className={detailCardClassName}>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                          Invitation ID
                        </p>
                        <p className="mt-2 break-words text-base font-semibold text-white">
                          {invitationId || '—'}
                        </p>
                      </div>

                      <div className={detailCardClassName}>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                          Invitation code
                        </p>
                        <p className="mt-2 break-words text-base font-semibold text-white">
                          {invitationCode || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="block">
                    <span className={labelClassName}>Invitation card language</span>
                    <select
                      value={cardLanguage}
                      onChange={(event) =>
                        setCardLanguage(event.target.value as LanguageKey)
                      }
                      className={inputClassName}
                    >
                      {Object.entries(translations).map(([key, bundle]) => (
                        <option key={key} value={key} className="text-black">
                          {bundle.ui.languageName}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-white/40">
                      This changes the invitation card and exports only.
                    </p>
                  </label>

                  <div className={panelClassName}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white/70">
                          Company logo
                        </div>
                        <div className="mt-1 text-xs text-white/35">
                          Upload or replace the logo for this download session. Spreadsheet logo notes are ignored unless they are real image URLs.
                        </div>
                      </div>

                      {logoUrl ? (
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-white/55 transition hover:border-blue-400/40 hover:bg-blue-500/10">
                      Upload logo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={(event) =>
                          handleLogoUpload(event.target.files?.[0] ?? null)
                        }
                        className="hidden"
                      />
                    </label>

                    {logoMessage ? (
                      <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                        {logoMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <h2 className="text-xl font-semibold">Choose your theme</h2>

                <div className="mt-5 grid gap-3">
                  {orderedThemeKeys.map((key) => {
                    const item = themes[key]
                    const active = theme === key

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTheme(key)}
                        className={`relative overflow-hidden rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-400/70 ${
                          active
                            ? 'border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.30),0_16px_38px_rgba(37,99,235,0.18)]'
                            : 'border-white/10 shadow-[0_14px_32px_rgba(0,0,0,0.22)]'
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-100"
                          style={{
                            backgroundImage: `url("${item.backgroundImage}")`,
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="relative">
                          <div className="text-xl font-semibold">
                            {item.label}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-white/[0.07] p-4 shadow-[0_-18px_48px_rgba(0,0,0,0.30)] backdrop-blur-xl">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => setShowDownloadPanel(true)}
              className="w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:opacity-50"
            >
              Download formats
            </button>

            {exportError ? (
              <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {exportError}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="relative hidden h-full min-h-0 items-center justify-center overflow-hidden bg-black/18 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />

          <div
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{ backgroundImage: `url("${themes[theme].backgroundImage}")` }}
          />

          <div className="absolute inset-0 bg-[#020617]/62" />

          <div className="relative scale-[0.46] xl:scale-[0.46] 2xl:scale-[0.46]">
            <InvitePreview
              companyName={companyName}
              standNumber={invitationId}
              invitationCode={invitationCode}
              logoUrl={logoUrl}
              registrationUrl={registrationUrl}
              theme={theme}
              language={cardLanguage}
              mode="secondary"
            />
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute -left-[99999px] top-0">
        <div ref={exportPreviewRef}>
          <InvitePreview
            companyName={companyName}
            standNumber={invitationId}
            invitationCode={invitationCode}
            logoUrl={logoUrl}
            registrationUrl={registrationUrl}
            theme={theme}
            language={cardLanguage}
            mode="secondary"
          />
        </div>

        <div ref={emailBannerExportRef}>
          <EmailBannerPreview
            companyName={companyName}
            standNumber={invitationId}
            invitationCode={invitationCode}
            logoUrl={logoUrl}
            registrationUrl={registrationUrl}
            theme={theme}
            language={cardLanguage}
            mode="secondary"
          />
        </div>
        <div ref={linkedinExportRef}>
          <LinkedInInvitePreview
            companyName={companyName}
            standNumber={invitationId}
            invitationCode={invitationCode}
            logoUrl={logoUrl}
            registrationUrl={registrationUrl}
            theme={theme}
            language={cardLanguage}
            mode="secondary"
          />
        </div>
      </div>

      {showDownloadPanel ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close download panel"
            onClick={() => setShowDownloadPanel(false)}
            className="absolute inset-0 bg-black/62 backdrop-blur-md"
          />

          <div className="relative w-full max-w-[520px] rounded-[32px] border border-white/12 bg-[#10162b]/94 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  Export assets
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  Download the format of your choice
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Choose a single format or download the complete ZIP pack.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDownloadPanel(false)}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                disabled={isExporting}
                onClick={() => runExport('square')}
                className="rounded-2xl border border-green-300/10 bg-[#2f6f3e] py-4 font-semibold text-white transition hover:bg-[#285f35] disabled:opacity-50"
              >
                PNG
              </button>

              <button
                disabled={isExporting}
                onClick={() => runExport('pdf')}
                className={secondaryButtonClassName}
              >
                PDF
              </button>

              <button
                disabled={isExporting}
                onClick={() => runExport('linkedin')}
                className={secondaryButtonClassName}
              >
                LinkedIn
              </button>

              <button
                disabled={isExporting}
                onClick={() => runExport('email')}
                className={secondaryButtonClassName}
              >
                Email Banner
              </button>

              <button
                disabled={isExporting}
                onClick={() => runExport('zip')}
                className="col-span-2 rounded-2xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                ZIP Pack (all formats)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
