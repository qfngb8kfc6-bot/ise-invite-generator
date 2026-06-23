'use client'

import { useEffect, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { themes } from '@/lib/themes'
import QrRingFrame from '@/components/QrRingFrame'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type EmailBannerPreviewProps = {
  companyName: string
  standNumber: string
  invitationCode: string
  logoUrl: string
  registrationUrl: string
  theme: ThemeKey
  language: LanguageKey
}

const EVENT_YEAR = process.env.NEXT_PUBLIC_EVENT_YEAR?.trim() || '2027'
const ISE_LOGO_WHITE = '/branding/ise-logo-white.png'

function getEmailBannerText(language: LanguageKey) {
  switch (language) {
    case 'es':
      return {
        headline: `Únase a nosotros en ISE ${EVENT_YEAR}`,
        freeTicket: 'Entrada gratuita',
        stand: 'Stand',
        code: 'Código',
        scan: 'Escanee para registrarse',
      }
    case 'de':
      return {
        headline: `Besuchen Sie uns auf der ISE ${EVENT_YEAR}`,
        freeTicket: 'Kostenloses Ticket',
        stand: 'Stand',
        code: 'Code',
        scan: 'Zum Registrieren scannen',
      }
    case 'fr':
      return {
        headline: `Rejoignez-nous à ISE ${EVENT_YEAR}`,
        freeTicket: 'Billet gratuit',
        stand: 'Stand',
        code: 'Code',
        scan: 'Scanner pour s’inscrire',
      }
    case 'it':
      return {
        headline: `Unisciti a noi a ISE ${EVENT_YEAR}`,
        freeTicket: 'Biglietto gratuito',
        stand: 'Stand',
        code: 'Codice',
        scan: 'Scansiona per registrarti',
      }
    case 'ca':
      return {
        headline: `Uneix-te a nosaltres a ISE ${EVENT_YEAR}`,
        freeTicket: 'ENTRADA GRATUÏTA',
        stand: 'Estand',
        code: 'Codi',
        scan: 'Escaneja per registrar-te',
      }
    case 'zh-CN':
      return {
        headline: `欢迎参加 ISE ${EVENT_YEAR}`,
        freeTicket: '免费门票',
        stand: '展位',
        code: '邀请码',
        scan: '扫码注册',
      }
    default:
      return {
        headline: `Join us at ISE ${EVENT_YEAR}`,
        freeTicket: 'FREE TICKET',
        stand: 'Stand',
        code: 'Code',
        scan: 'Scan to register',
      }
  }
}

export default function EmailBannerPreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  registrationUrl,
  theme,
  language,
}: EmailBannerPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)

  const selectedTheme = themes[theme] ?? themes.audio
  const text = getEmailBannerText(language)

  useEffect(() => {
    let active = true

    async function generateQr() {
      try {
        const value = await makeQrDataUrl(registrationUrl)
        if (active) setQrDataUrl(value)
      } catch {
        if (active) setQrDataUrl('')
      }
    }

    generateQr()

    return () => {
      active = false
    }
  }, [registrationUrl])

  return (
    <div className="relative h-[300px] w-[1200px] overflow-hidden bg-[#06194c] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${selectedTheme.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06194c]/96 via-[#06194c]/82 to-[#06194c]/54" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(0,217,255,0.32),transparent_34%)]" />

      <div className="relative flex h-full items-center justify-between gap-8 px-10 py-8">
        <div className="flex h-full min-w-0 flex-1 items-center gap-8">
          <div className="flex w-[250px] shrink-0 flex-col justify-center">
            <img
              src={ISE_LOGO_WHITE}
              alt="Integrated Systems Europe"
              className="h-[76px] w-auto object-contain object-left"
            />

            <p className="mt-5 text-[14px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              {text.freeTicket}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[22px] font-semibold leading-tight text-white/86">
              {text.headline}
            </p>

            <h2 className="mt-3 max-w-[560px] break-words text-[44px] font-black uppercase leading-[0.9] tracking-[-0.055em] text-white">
              {companyName || 'Company name'}
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-[18px] font-bold text-white">
              <div className="rounded-full border border-white/18 bg-white/10 px-5 py-2">
                {text.stand}: {standNumber || '—'}
              </div>

              <div className="rounded-full border border-white/18 bg-white/10 px-5 py-2">
                {text.code}: {invitationCode || '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full w-[350px] shrink-0 items-center justify-end gap-5">
          <div className="flex h-[105px] w-[160px] items-center justify-center rounded-[8px] border border-white/18 bg-white px-4">
            {logoUrl && failedLogoUrl !== logoUrl ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="max-h-[76px] max-w-[130px] object-contain"
                onError={() => setFailedLogoUrl(logoUrl)}
              />
            ) : (
              <span className="text-center text-[11px] font-semibold text-zinc-400">
                Logo unavailable
              </span>
            )}
          </div>

          <div className="flex w-[170px] flex-col items-center">
            <QrRingFrame
              variant="email"
              qrDataUrl={qrDataUrl}
              unavailableText="QR unavailable"
            />

            <p className="mt-3 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-white/78">
              {text.scan}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
