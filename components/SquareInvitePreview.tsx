'use client'

import { useEffect, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { themes } from '@/lib/themes'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type SquareInvitePreviewProps = {
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

function getSquareText(language: LanguageKey) {
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
    case 'pt':
      return {
        joinUs: `Junte-se a nós na ISE ${EVENT_YEAR}`,
        invitation: 'Convite',
        freeTicket: 'Bilhete gratuito',
        stand: 'Stand',
        code: 'Código',
        scan: 'Digitalize para se registar',
      }
    case 'nl':
      return {
        joinUs: `Bezoek ons op ISE ${EVENT_YEAR}`,
        invitation: 'Uitnodiging',
        freeTicket: 'Gratis ticket',
        stand: 'Stand',
        code: 'Code',
        scan: 'Scan om te registreren',
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

export default function SquareInvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  registrationUrl,
  theme,
  language,
}: SquareInvitePreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)

  const selectedTheme = themes[theme] ?? themes.audio
  const text = getSquareText(language)

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
    <div className="relative h-[1080px] w-[1080px] overflow-hidden bg-[#06194c] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${selectedTheme.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#06194c]/98 via-[#06194c]/86 to-[#1b1464]/68" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(0,217,255,0.26),transparent_34%)]" />

      <div className="relative flex h-full flex-col p-[60px]">
        <header className="flex items-start justify-between gap-10">
          <img
            src={ISE_LOGO_WHITE}
            alt="Integrated Systems Europe"
            className="h-[120px] w-auto object-contain"
          />

          <div className="text-right text-[24px] font-semibold leading-tight text-white/86">
            <div>Fira de Barcelona | Gran Via</div>
            <div>3 - 6 February {EVENT_YEAR}</div>
          </div>
        </header>

        <main className="mt-[72px] grid flex-1 grid-cols-[1fr_330px] gap-12">
          <section className="min-w-0">
            <p className="text-[30px] font-semibold leading-tight text-white/82">
              {text.joinUs}
            </p>

            <h1 className="mt-5 text-[92px] font-black uppercase leading-[0.88] tracking-[-0.065em] text-white">
              {text.invitation}
            </h1>

            <div className="mt-[58px] rounded-[34px] border border-white/14 bg-white/[0.08] p-8 backdrop-blur-sm">
              <p className="text-[18px] font-semibold uppercase tracking-[0.26em] text-cyan-200">
                {text.freeTicket}
              </p>

              <h2 className="mt-5 max-w-[520px] break-words text-[54px] font-black uppercase leading-[0.92] tracking-[-0.055em] text-white">
                {companyName || 'Company name'}
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-[22px] border border-white/15 bg-white/10 px-5 py-4">
                  <p className="text-[15px] font-semibold uppercase tracking-[0.18em] text-white/56">
                    {text.stand}
                  </p>
                  <p className="mt-2 break-words text-[30px] font-bold leading-tight text-white">
                    {standNumber || '—'}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/15 bg-white/10 px-5 py-4">
                  <p className="text-[15px] font-semibold uppercase tracking-[0.18em] text-white/56">
                    {text.code}
                  </p>
                  <p className="mt-2 break-words text-[30px] font-bold leading-tight text-white">
                    {invitationCode || '—'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col items-center justify-start pt-[165px]">
            <div className="flex h-[135px] w-[260px] items-center justify-center rounded-[14px] border border-white/14 bg-white px-5 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
              {logoUrl && failedLogoUrl !== logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  className="max-h-[92px] max-w-[215px] object-contain"
                  onError={() => setFailedLogoUrl(logoUrl)}
                />
              ) : (
                <span className="text-center text-[14px] font-semibold text-zinc-400">
                  Logo unavailable
                </span>
              )}
            </div>

            <p className="mt-8 text-center text-[18px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              {text.scan}
            </p>

            <div className="mt-5 rounded-[30px] bg-white p-4 shadow-[0_24px_58px_rgba(0,0,0,0.28)]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Registration QR code"
                  className="h-[205px] w-[205px] object-contain"
                />
              ) : (
                <div className="flex h-[205px] w-[205px] items-center justify-center text-center text-[14px] font-semibold text-zinc-400">
                  QR unavailable
                </div>
              )}
            </div>
          </aside>
        </main>

        <footer className="mt-8 flex items-center justify-between">
          <p className="max-w-[560px] text-[22px] font-semibold leading-tight text-white/82">
            Register free using your exhibitor invitation code and secure your visitor pass for ISE {EVENT_YEAR}.
          </p>

          <img
            src="/branding/toolkit/ise-partners-footer.png"
            alt="A joint venture partnership of AVIXA and CEDIA"
            className="h-auto w-[220px] rounded-sm bg-white/95 p-2"
          />
        </footer>
      </div>
    </div>
  )
}
