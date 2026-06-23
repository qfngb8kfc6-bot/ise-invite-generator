'use client'

import { useEffect, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { themes } from '@/lib/themes'
import QrRingFrame from '@/components/QrRingFrame'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type LinkedInInvitePreviewProps = {
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

function getLinkedInText(language: LanguageKey) {
  switch (language) {
    case 'es':
      return {
        joinUs: `Únase a nosotros en ISE ${EVENT_YEAR}`,
        invitation: 'Invitación',
        freeTicket: 'Entrada gratuita',
        stand: 'Stand',
        code: 'Código',
        scan: 'Escanee para registrarse',
      }
    case 'de':
      return {
        joinUs: `Besuchen Sie uns auf der ISE ${EVENT_YEAR}`,
        invitation: 'Einladung',
        freeTicket: 'Kostenloses Ticket',
        stand: 'Stand',
        code: 'Code',
        scan: 'Zum Registrieren scannen',
      }
    case 'fr':
      return {
        joinUs: `Rejoignez-nous à ISE ${EVENT_YEAR}`,
        invitation: 'Invitation',
        freeTicket: 'Billet gratuit',
        stand: 'Stand',
        code: 'Code',
        scan: 'Scanner pour s’inscrire',
      }
    case 'it':
      return {
        joinUs: `Unisciti a noi a ISE ${EVENT_YEAR}`,
        invitation: 'Invito',
        freeTicket: 'Biglietto gratuito',
        stand: 'Stand',
        code: 'Codice',
        scan: 'Scansiona per registrarti',
      }
    case 'ca':
      return {
        joinUs: `Uneix-te a nosaltres a ISE ${EVENT_YEAR}`,
        invitation: 'Invitació',
        freeTicket: 'ENTRADA GRATUÏTA',
        stand: 'Estand',
        code: 'Codi',
        scan: 'Escaneja per registrar-te',
      }
    case 'zh-CN':
      return {
        joinUs: `欢迎参加 ISE ${EVENT_YEAR}`,
        invitation: '邀请函',
        freeTicket: '免费门票',
        stand: '展位',
        code: '邀请码',
        scan: '扫码注册',
      }
    default:
      return {
        joinUs: `Join us at ISE ${EVENT_YEAR}`,
        invitation: 'Invitation',
        freeTicket: 'FREE TICKET',
        stand: 'Stand',
        code: 'Code',
        scan: 'Scan to register',
      }
  }
}

export default function LinkedInInvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  registrationUrl,
  theme,
  language,
}: LinkedInInvitePreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)

  const selectedTheme = themes[theme] ?? themes.audio
  const text = getLinkedInText(language)

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
    <div className="relative h-[627px] w-[1200px] overflow-hidden bg-[#06194c] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${selectedTheme.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06194c]/98 via-[#06194c]/86 to-[#1b1464]/56" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_35%,rgba(0,217,255,0.28),transparent_34%)]" />

      <div className="relative flex h-full flex-col px-[58px] py-[46px]">
        <header className="flex items-start justify-between gap-10">
          <img
            src={ISE_LOGO_WHITE}
            alt="Integrated Systems Europe"
            className="h-[86px] w-auto object-contain"
          />

          <div className="text-right text-[20px] font-semibold leading-tight text-white/86">
            <div>Fira de Barcelona | Gran Via</div>
            <div>3 - 6 February {EVENT_YEAR}</div>
          </div>
        </header>

        <main className="mt-[52px] grid flex-1 grid-cols-[1fr_330px] gap-10">
          <section className="min-w-0">
            <p className="text-[25px] font-semibold leading-tight text-white/82">
              {text.joinUs}
            </p>

            <h1 className="mt-4 text-[72px] font-black uppercase leading-[0.88] tracking-[-0.065em] text-white">
              {text.invitation}
            </h1>

            <div className="mt-[38px] rounded-[30px] border border-white/14 bg-white/[0.08] p-7 backdrop-blur-sm">
              <p className="text-[16px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {text.freeTicket}
              </p>

              <h2 className="mt-4 max-w-[560px] break-words text-[46px] font-black uppercase leading-[0.92] tracking-[-0.055em] text-white">
                {companyName || 'Company name'}
              </h2>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-[20px] border border-white/15 bg-white/10 px-5 py-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/56">
                    {text.stand}
                  </p>
                  <p className="mt-1 break-words text-[25px] font-bold leading-tight text-white">
                    {standNumber || '—'}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/15 bg-white/10 px-5 py-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/56">
                    {text.code}
                  </p>
                  <p className="mt-1 break-words text-[25px] font-bold leading-tight text-white">
                    {invitationCode || '—'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col items-center justify-start pt-[80px]">
            <div className="flex h-[108px] w-[220px] items-center justify-center rounded-[12px] border border-white/14 bg-white px-5 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
              {logoUrl && failedLogoUrl !== logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  className="max-h-[76px] max-w-[180px] object-contain"
                  onError={() => setFailedLogoUrl(logoUrl)}
                />
              ) : (
                <span className="text-center text-[13px] font-semibold text-zinc-400">
                  Logo unavailable
                </span>
              )}
            </div>

            <p className="mt-7 text-center text-[14px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              {text.scan}
            </p>

            <div className="mt-2">
              <QrRingFrame
                variant="linkedin"
                qrDataUrl={qrDataUrl}
                unavailableText="QR unavailable"
              />
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
