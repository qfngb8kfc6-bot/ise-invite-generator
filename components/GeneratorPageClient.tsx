'use client'

import { useEffect, useRef, useState } from 'react'
import InvitePreview from '@/components/InvitePreview'
import { useSiteLanguage } from '@/components/LanguageSwitcher'
import {
  exportPdf,
  exportPng,
  exportZipPack,
  makeExportBaseName,
  type ExportFormatKey,
} from '@/lib/export'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { ThemeKey } from '@/lib/types'

type Props = {
  initialToken?: string
}

export default function GeneratorPageClient({ initialToken }: Props) {
  const exportPreviewRef = useRef<HTMLDivElement | null>(null)
  const [language] = useSiteLanguage()
  const text = translations[language].ui
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('Samsung')
  const [standNumber, setStandNumber] = useState('5C300')
  const [invitationCode, setInvitationCode] = useState('ISE2027')
  const [registrationUrl, setRegistrationUrl] = useState('https://registration.example.com')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoMessage, setLogoMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeKey>('audio')

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
          setLogoMessage('{text.generatorLogoUpload}ed, but recommended minimum size is 300 × 120px for best export quality.')
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

  useEffect(() => {
    async function loadSession() {
      if (!initialToken) return

      try {
        setSessionMessage('Loading verified exhibitor details...')

        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: initialToken }),
        })

        const data = await response.json()

        if (!response.ok || !data?.ok || !data?.exhibitor) {
          setSessionMessage(data?.error || 'Could not verify exhibitor session.')
          return
        }

        const exhibitor = data.exhibitor

        setCompanyName(exhibitor.companyName || exhibitor.name || companyName)
        setStandNumber(exhibitor.standNumber || exhibitor.stand || standNumber)
        setInvitationCode(exhibitor.invitationCode || exhibitor.code || invitationCode)
        setRegistrationUrl(exhibitor.registrationUrl || registrationUrl)
        setLogoUrl(exhibitor.logoUrl || '')

        if (exhibitor.theme) {
          setTheme(exhibitor.theme)
        }

        setSessionMessage('Verified exhibitor details loaded.')
      } catch {
        setSessionMessage('Could not load exhibitor details.')
      }
    }

    loadSession()
  }, [initialToken])

  async function runExport(type: 'pdf' | 'zip' | ExportFormatKey) {
    if (!exportPreviewRef.current) {
      setExportError('Preview element not found.')
      return
    }

    try {
      setIsExporting(true)
      setExportError(null)

      const baseName = makeExportBaseName(companyName, standNumber)

      if (type === 'pdf') {
        await exportPdf(exportPreviewRef.current, baseName)
        return
      }

      if (type === 'zip') {
        await exportZipPack(exportPreviewRef.current, baseName)
        return
      }

      await exportPng(exportPreviewRef.current, type, baseName)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="h-[calc(100vh-92px)] overflow-hidden bg-[#020617] text-white">
      <div className="grid h-full lg:grid-cols-[420px_1fr]">
        <aside className="flex h-full min-h-0 flex-col border-r border-white/10 bg-[#050816]/95">
          <div className="border-b border-white/10 px-7 py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              ISE 2027
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              {text.generatorTitle}
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/45">
              {text.generatorInputsDescription}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-5">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold">{text.generatorInputsTitle}</h2>
                <p className="mt-1 text-sm text-white/40">{text.generatorInputsDescription}</p>

                {sessionMessage ? (
                  <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
                    {sessionMessage}
                  </div>
                ) : null}

                <div className="mt-4 space-y-3">
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={standNumber} onChange={(e) => setStandNumber(e.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                    <input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                  </div>
                  <input value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white/70">{text.generatorLogoUpload}</div>
                        <div className="mt-1 text-xs text-white/35">PNG/JPG/WebP. Max 3MB. Recommended 300 × 120px minimum.</div>
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
                      {text.generatorLogoUpload}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>

                    {logoMessage ? (
                      <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                        {logoMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold">{text.generatorTheme}</h2>
                <div className="mt-5 grid gap-3">
                  {Object.entries(themes).map(([key, item]) => {
                    const active = theme === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTheme(key as ThemeKey)}
                        className={`relative overflow-hidden rounded-3xl border p-5 text-left transition ${
                          active ? 'border-blue-400' : 'border-white/10'
                        }`}
                      >
                        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${item.backgroundImage})` }} />
                        <div className="absolute inset-0 bg-black/75" />
                        <div className="relative">
                          <div className="text-xl font-semibold">{item.label}</div>
                          <div className="mt-1 text-sm text-white/45">{text.generatorPreviewDescription}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <button disabled={isExporting} onClick={() => runExport('square')} className="rounded-2xl bg-blue-600 py-3 font-semibold disabled:opacity-50">{text.generatorPngSquare}</button>
              <button disabled={isExporting} onClick={() => runExport('pdf')} className="rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold disabled:opacity-50">{text.generatorPdf}</button>
              <button disabled={isExporting} onClick={() => runExport('linkedin')} className="rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold disabled:opacity-50">LinkedIn</button>
              <button disabled={isExporting} onClick={() => runExport('zip')} className="rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold disabled:opacity-50">{text.generatorZipPack}</button>
            </div>

            {exportError ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {exportError}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="relative hidden h-full min-h-0 items-center justify-center overflow-hidden bg-[#02050f] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
          <div className="relative scale-[0.54] xl:scale-[0.62] 2xl:scale-[0.72]">
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
        </section>
      </div>

      <div className="pointer-events-none absolute -left-[99999px] top-0">
        <div ref={exportPreviewRef}>
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
    </main>
  )
}
