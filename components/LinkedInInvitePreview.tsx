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
        hasInvited: `le ha invitado a ISE ${EVENT_YEAR}`,
        stand: 'Número de stand',
        scan: 'Entrada gratuita — escanee para registrarse',
        codePrefix: 'Únase gratis y ahorre €250 con su código de invitación:',
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: 'El evento tecnológico anual de referencia mundial ha vuelto.',
        bodyOne: 'Las últimas innovaciones del mundo. Los mayores innovadores del mundo.',
        bodyTwo: 'ISE 2027 reunirá todo para su mejor edición hasta la fecha.',
        bodyFinal: 'Porque le espera un mundo de oportunidades...',
      }
    case 'de':
      return {
        joinUs: `Besuchen Sie uns auf der ISE ${EVENT_YEAR}`,
        invitation: 'Einladung',
        hasInvited: `hat Sie zur ISE ${EVENT_YEAR} eingeladen`,
        stand: 'Standnummer',
        scan: 'Kostenloses Ticket — zum Registrieren scannen',
        codePrefix: 'Kostenlos teilnehmen und €250 mit Ihrem Einladungscode sparen:',
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: 'Die weltbekannte jährliche Tech-Show ist zurück.',
        bodyOne: 'Die neuesten Innovationen der Welt. Die größten Innovatoren der Welt.',
        bodyTwo: 'ISE 2027 bringt alles zur bislang besten Ausgabe zusammen.',
        bodyFinal: 'Denn eine Welt voller Möglichkeiten erwartet Sie...',
      }
    case 'fr':
      return {
        joinUs: `Rejoignez-nous à ISE ${EVENT_YEAR}`,
        invitation: 'Invitation',
        hasInvited: `vous invite à ISE ${EVENT_YEAR}`,
        stand: 'Numéro de stand',
        scan: 'Billet gratuit — scanner pour s’inscrire',
        codePrefix: 'Participez gratuitement et économisez 250 € avec votre code d’invitation :',
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: 'Le salon technologique annuel de renommée mondiale est de retour.',
        bodyOne: 'Les dernières innovations du monde. Les plus grands innovateurs du monde.',
        bodyTwo: 'ISE 2027 réunira le tout pour sa meilleure édition à ce jour.',
        bodyFinal: 'Parce qu’un monde d’opportunités vous attend...',
      }
    case 'it':
      return {
        joinUs: `Unisciti a noi a ISE ${EVENT_YEAR}`,
        invitation: 'Invito',
        hasInvited: `ti ha invitato a ISE ${EVENT_YEAR}`,
        stand: 'Numero stand',
        scan: 'Biglietto gratuito — scansiona per registrarti',
        codePrefix: 'Partecipa gratis e risparmia €250 con il tuo codice invito:',
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: 'Il salone tecnologico annuale di fama mondiale è tornato.',
        bodyOne: 'Le ultime innovazioni del mondo. I più grandi innovatori del mondo.',
        bodyTwo: 'ISE 2027 riunirà tutto nella sua migliore edizione di sempre.',
        bodyFinal: 'Perché ti aspetta un mondo di opportunità...',
      }
    case 'ca':
      return {
        joinUs: `Uneix-te a nosaltres a ISE ${EVENT_YEAR}`,
        invitation: 'Invitació',
        hasInvited: `t’ha convidat a ISE ${EVENT_YEAR}`,
        stand: "Número d'estand",
        scan: 'Entrada gratuïta — escaneja per registrar-te',
        codePrefix: "Uneix-te gratis i estalvia 250 € amb el teu codi d'invitació:",
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: 'El saló tecnològic anual de renom mundial torna.',
        bodyOne: 'Les últimes innovacions del món. Els grans innovadors del món.',
        bodyTwo: 'ISE 2027 ho reunirà tot en la seva millor edició fins ara.',
        bodyFinal: "Perquè t'espera un món d'oportunitats...",
      }
    case 'zh-CN':
      return {
        joinUs: `欢迎参加 ISE ${EVENT_YEAR}`,
        invitation: '邀请函',
        hasInvited: `邀请您参加 ISE ${EVENT_YEAR}`,
        stand: '展位号',
        scan: '免费门票 — 扫码注册',
        codePrefix: '免费参加并使用邀请码节省 €250：',
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: '享誉全球的年度科技展回归。',
        bodyOne: '全球最新创新。全球顶尖创新者。',
        bodyTwo: 'ISE 2027 将汇聚一切，打造迄今最佳一届展会。',
        bodyFinal: '无限机遇正在等待您……',
      }
    default:
      return {
        joinUs: `Join us at ISE ${EVENT_YEAR}`,
        invitation: 'Invitation',
        hasInvited: `has invited you to ISE ${EVENT_YEAR}`,
        stand: 'Stand number/s',
        scan: 'Free ticket — scan to register',
        codePrefix: 'Join us for FREE and save €250 with your invitation code:',
        campaignLineOne: 'BRING YOUR WORLD.',
        campaignLineTwo: 'UNITE WITH US.',
        bodyLead: 'The world-renowned annual tech show is back.',
        bodyOne: 'The world’s latest innovations. The world’s greatest innovators.',
        bodyTwo: 'ISE 2027 is set to bring it all together for its best edition yet.',
        bodyFinal: 'Because a world of opportunity awaits...',
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#06194c]/98 via-[#06194c]/88 to-[#06194c]/72" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,25,76,0.12),rgba(6,25,76,0.68))]" />

      <div className="relative flex h-full flex-col px-[54px] py-[34px]">
        <header className="flex items-start justify-between gap-8">
          <img
            src={ISE_LOGO_WHITE}
            alt="Integrated Systems Europe"
            className="h-[76px] w-auto object-contain"
          />

          <div className="text-right text-[18px] font-semibold leading-tight text-white/86">
            <div>Fira de Barcelona | Gran Via</div>
            <div>2 - 5 February {EVENT_YEAR}</div>
          </div>
        </header>

        <main className="mt-[34px] grid flex-1 grid-cols-[720px_1fr] gap-[54px]">
          <section className="min-w-0">
            <p className="text-[21px] font-semibold leading-tight text-white/78">
              {text.joinUs}
            </p>

            <div className="mt-[18px] rounded-[28px] border border-white/12 bg-white/[0.09] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                {text.invitation}
              </p>

              <h2 className="max-w-[610px] break-words text-[34px] font-black uppercase leading-[0.92] tracking-[-0.055em] text-white">
                {companyName || 'Company name'}
              </h2>

              <p className="mt-1 text-[15px] font-semibold text-white/76">
                {text.hasInvited}
              </p>

              <div className="mt-5">
                <p className="text-[27px] font-black uppercase leading-[0.88] tracking-[-0.06em] text-white">
                  {text.campaignLineOne}
                </p>
                <p className="text-[27px] font-black uppercase leading-[0.88] tracking-[-0.06em] text-white">
                  {text.campaignLineTwo}
                </p>
              </div>

              <div className="mt-3 max-w-[640px] text-[12.5px] leading-[1.34] text-white/74">
                <p className="font-semibold text-white/90">{text.bodyLead}</p>
                <p className="mt-1">{text.bodyOne}</p>
                <p>{text.bodyTwo}</p>
                <p className="mt-1 font-semibold text-white/90">{text.bodyFinal}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-[16px] border border-white/14 bg-white/10 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    {text.stand}
                  </p>
                  <p className="mt-1 break-words text-[19px] font-bold leading-tight text-white">
                    {standNumber || '—'}
                  </p>
                </div>

                <div className="rounded-[16px] border border-white/14 bg-white/10 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Code
                  </p>
                  <p className="mt-1 break-words text-[19px] font-bold leading-tight text-white">
                    {invitationCode || '—'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[13px] font-semibold leading-tight text-cyan-200">
                {text.codePrefix} <span className="text-white">{invitationCode || '—'}</span>
              </p>
            </div>
          </section>

          <aside className="flex h-full flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.065] px-7 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <div className="flex h-[110px] w-[220px] items-center justify-center rounded-[16px] border border-white/14 bg-white px-5 shadow-[0_18px_42px_rgba(0,0,0,0.20)]">
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

            <p className="mt-7 max-w-[230px] text-center text-[12px] font-bold uppercase tracking-[0.17em] text-cyan-200">
              {text.scan}
            </p>

            <div className="mt-3">
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
