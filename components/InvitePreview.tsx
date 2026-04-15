'use client'

import { useEffect, useState } from 'react'
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
    <div className="w-[1200px] overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="grid min-h-[627px] md:grid-cols-2">
        <div
          className="relative flex flex-col justify-between p-10 text-white"
          style={{
            backgroundImage: `url(${selectedTheme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10">
            <p className="mb-2 text-sm uppercase tracking-[0.2em]">ISE 2026</p>
            <h2 className="mb-3 text-4xl font-bold">{text.headline}</h2>
            <p className="text-xl">{text.subheadline}</p>
          </div>

          <div className="relative z-10 rounded-xl bg-white/10 p-4 text-sm backdrop-blur-sm">
            {text.freeAccess}
          </div>
        </div>

        <div className="flex flex-col justify-center p-10">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={`${companyName} logo`}
              className="mb-6 h-20 max-w-56 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="mb-6 flex h-20 w-56 items-center justify-center rounded border text-sm text-gray-400">
              Logo unavailable
            </div>
          )}

          <h3 className="mb-3 text-3xl font-bold">{companyName}</h3>

          <p className="mb-2 text-xl">
            {text.visitUs} <strong>{standNumber}</strong>
          </p>

          <p className="mb-5 text-xl">
            {text.codeLabel} <strong>{invitationCode}</strong>
          </p>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Registration QR code"
              className="mb-3 h-36 w-36 rounded-lg border object-contain"
            />
          ) : (
            <div className="mb-3 flex h-36 w-36 items-center justify-center rounded-lg border text-sm text-gray-500">
              QR unavailable
            </div>
          )}

          <p className="break-all text-xs text-gray-500">{registrationUrl}</p>
        </div>
      </div>
    </div>
  )
}