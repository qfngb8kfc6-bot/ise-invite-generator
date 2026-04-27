'use client'

import { useEffect, useMemo, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type InvitePreviewProps = {
  companyName: string
  standNumber: string
  invitationCode: string
  logoUrl: string
  registrationUrl: string
  theme: ThemeKey
  language: LanguageKey
}

const EVENT_YEAR = process.env.NEXT_PUBLIC_EVENT_YEAR?.trim() || '2027'

function replaceYear(text: string, year: string) {
  return text.replace(/\b20\d{2}\b/g, year)
}

export default function InvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  registrationUrl,
  theme,
  language,
}: InvitePreviewProps) {
  const [logoError, setLogoError] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const text = translations[language].invite
  const selectedTheme = themes[theme]

  const headline = useMemo(
    () => replaceYear(text.headline, EVENT_YEAR),
    [text.headline]
  )

  const eventLabel = `ISE ${EVENT_YEAR}`

  const boothList = useMemo(() => {
    return standNumber
      .split(/[;,]/)
      .map((value) => value.trim())
      .filter(Boolean)
  }, [standNumber])

  const hasMultipleBooths = boothList.length > 1
  const boothDisplay = boothList.join(', ')

  useEffect(() => {
    async function generateQr() {
      try {
        const url = await makeQrDataUrl(registrationUrl)
        setQrDataUrl(url)
      } catch {
        setQrDataUrl('')
      }
    }

    generateQr()
  }, [registrationUrl])

  useEffect(() => {
    setLogoError(false)
  }, [logoUrl])

  return (
    <div className="w-[1200px] overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl">
      <div className="grid min-h-[627px] grid-cols-2">
        <div
          className="relative flex flex-col justify-between overflow-hidden p-12 text-white"
          style={{
            backgroundImage: `url(${selectedTheme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/25 to-black/65" />

          <div className="relative z-10">
            <div className="mb-8 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] backdrop-blur">
              {eventLabel}
            </div>

            <h2 className="max-w-[460px] text-5xl font-bold leading-[1.05] tracking-tight">
              {headline}
            </h2>

            <p className="mt-5 max-w-[420px] text-2xl font-medium text-white/90">
              {text.subheadline}
            </p>
          </div>

          <div className="relative z-10 rounded-3xl border border-white/15 bg-black/35 p-5 text-base font-medium text-white shadow-xl backdrop-blur">
            {text.freeAccess}
          </div>
        </div>

        <div className="flex flex-col justify-between bg-white p-12 text-zinc-950">
          <div>
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="mb-10 h-24 max-w-[280px] object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="mb-10 flex h-24 w-[280px] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-400">
                Logo unavailable
              </div>
            )}

            <h3 className="max-w-[440px] text-4xl font-bold leading-tight tracking-tight text-zinc-950">
              {companyName || 'Company name'}
            </h3>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {hasMultipleBooths ? 'Booths' : 'Booth'}
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-950">
                  {boothDisplay || '—'}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {text.codeLabel.replace(':', '')}
                </div>
                <div className="mt-2 break-all text-2xl font-bold text-zinc-950">
                  {invitationCode || '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-end gap-6">
            <div>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Registration QR code"
                  className="h-40 w-40 rounded-2xl border border-zinc-200 bg-white object-contain p-2"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-400">
                  QR unavailable
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-950">
                Scan to register
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-zinc-500">
                {registrationUrl || 'Registration URL unavailable'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}