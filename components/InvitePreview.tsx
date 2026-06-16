'use client'

import { useEffect, useMemo, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
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

const TOOLKIT_INVITE_BACKGROUND = '/branding/toolkit/ise-invitecard.png'
const ISE_LOGO_WHITE = '/branding/ise-logo-white.png'

function getFallbackInviteText(language: LanguageKey) {
  switch (language) {
    case 'es':
      return { logoUnavailable: 'Logotipo no disponible', companyName: 'Nombre de la empresa', booth: 'Número de stand', booths: 'Números de stand', invitationCode: 'Código de invitación', qrUnavailable: 'QR no disponible', scanToRegister: 'Escanee para registrarse', registrationUrlUnavailable: 'URL de registro no disponible', freePass: 'Pase gratuito para visitantes', saveTicket: 'Guarde su entrada gratuita', headline: 'Su invitación a ISE' }
    case 'de':
      return { logoUnavailable: 'Logo nicht verfügbar', companyName: 'Firmenname', booth: 'Standnummer', booths: 'Standnummern', invitationCode: 'Einladungscode', qrUnavailable: 'QR nicht verfügbar', scanToRegister: 'Zum Registrieren scannen', registrationUrlUnavailable: 'Registrierungs-URL nicht verfügbar', freePass: 'Kostenloser Besucherpass', saveTicket: 'Sichern Sie sich Ihr kostenloses Ticket', headline: 'Ihre Einladung zur ISE' }
    case 'fr':
      return { logoUnavailable: 'Logo indisponible', companyName: 'Nom de l’entreprise', booth: 'Numéro de stand', booths: 'Numéros de stand', invitationCode: 'Code d’invitation', qrUnavailable: 'QR indisponible', scanToRegister: 'Scanner pour s’inscrire', registrationUrlUnavailable: 'URL d’inscription indisponible', freePass: 'Pass visiteur gratuit', saveTicket: 'Réservez votre billet gratuit', headline: 'Votre invitation à ISE' }
    case 'it':
      return { logoUnavailable: 'Logo non disponibile', companyName: 'Nome azienda', booth: 'Numero stand', booths: 'Numeri stand', invitationCode: 'Codice di invito', qrUnavailable: 'QR non disponibile', scanToRegister: 'Scansiona per registrarti', registrationUrlUnavailable: 'URL di registrazione non disponibile', freePass: 'Pass visitatore gratuito', saveTicket: 'Ottieni il tuo biglietto gratuito', headline: 'Il tuo invito a ISE' }
    case 'pt':
      return { logoUnavailable: 'Logótipo indisponível', companyName: 'Nome da empresa', booth: 'Número do stand', booths: 'Números dos stands', invitationCode: 'Código de convite', qrUnavailable: 'QR indisponível', scanToRegister: 'Digitalize para se registar', registrationUrlUnavailable: 'URL de registo indisponível', freePass: 'Passe gratuito de visitante', saveTicket: 'Garanta o seu bilhete gratuito', headline: 'O seu convite para ISE' }
    case 'nl':
      return { logoUnavailable: 'Logo niet beschikbaar', companyName: 'Bedrijfsnaam', booth: 'Standnummer', booths: 'Standnummers', invitationCode: 'Uitnodigingscode', qrUnavailable: 'QR niet beschikbaar', scanToRegister: 'Scan om te registreren', registrationUrlUnavailable: 'Registratie-URL niet beschikbaar', freePass: 'Gratis bezoekerspas', saveTicket: 'Claim uw gratis ticket', headline: 'Uw uitnodiging voor ISE' }
    case 'zh-CN':
      return { logoUnavailable: '暂无标志', companyName: '公司名称', booth: '展位号', booths: '展位号', invitationCode: '邀请码', qrUnavailable: '二维码不可用', scanToRegister: '扫码注册', registrationUrlUnavailable: '注册链接不可用', freePass: '免费观众通行证', saveTicket: '领取您的免费门票', headline: '您的 ISE 邀请函' }
    default:
      return { logoUnavailable: 'Logo unavailable', companyName: 'Company name', booth: 'Stand number', booths: 'Stand numbers', invitationCode: 'Invitation code', qrUnavailable: 'QR unavailable', scanToRegister: 'Scan to register', registrationUrlUnavailable: 'Registration URL unavailable', freePass: 'Free visitor pass', saveTicket: 'Save your free ticket', headline: 'Your invitation to ISE' }
  }
}

export default function InvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  registrationUrl,
  language,
}: InvitePreviewProps) {
  const [failedLogoUrl, setFailedLogoUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const text = translations[language].invite
  const fallbackText = getFallbackInviteText(language)

  const boothList = useMemo(() => {
    return standNumber
      .split(/[;,]/)
      .map((value) => value.trim())
      .filter(Boolean)
  }, [standNumber])

  const hasMultipleBooths = boothList.length > 1
  const boothDisplay = boothList.join(' · ')

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

  return (
    <div className="w-[820px] overflow-hidden rounded-[18px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
      <section
        className="relative h-[430px] overflow-hidden bg-[#06194c] px-12 py-10 text-white"
        style={{
          backgroundImage: `url(${TOOLKIT_INVITE_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#06194c]/96 via-[#06194c]/72 to-[#06194c]/28" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(34,211,238,0.22),transparent_34%)]" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-8">
            <img
              src={ISE_LOGO_WHITE}
              alt="Integrated Systems Europe"
              className="h-[72px] w-auto object-contain"
            />

            <div className="text-right text-[13px] font-semibold leading-tight text-white/85">
              <div>Fira de Barcelona | Gran Via</div>
              <div>3 - 6 February {EVENT_YEAR}</div>
            </div>
          </div>

          <div className="max-w-[620px]">
            <p className="text-[17px] font-medium text-white/86">
              Join us at ISE {EVENT_YEAR}
            </p>

            <h2 className="mt-4 text-[76px] font-semibold uppercase leading-[0.9] tracking-[-0.055em] text-white">
              Invitation
            </h2>
          </div>
        </div>
      </section>

      <section className="min-h-[610px] bg-white px-12 py-10 text-[#141442]">
        <div className="grid grid-cols-[1fr_210px] gap-8">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#2956ff]">
              {fallbackText.companyName}
            </p>

            <h3 className="mt-2 max-w-[520px] break-words text-[38px] font-semibold uppercase leading-[0.95] tracking-[-0.055em] text-[#080832]">
              {companyName || fallbackText.companyName}
            </h3>

            <p className="mt-2 text-[17px] font-semibold leading-tight text-[#141442]/78">
              is inviting you to ISE {EVENT_YEAR}
            </p>

            <div className="mt-5 grid max-w-[520px] grid-cols-2 gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#141442]/42">
                  {hasMultipleBooths ? fallbackText.booths : fallbackText.booth}
                </p>

                <p className="mt-2 break-words text-[22px] font-semibold leading-tight text-[#080832]">
                  {boothDisplay || '—'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#141442]/42">
                  {fallbackText.invitationCode}
                </p>

                <p className="mt-2 break-words text-[22px] font-semibold leading-tight text-[#080832]">
                  {invitationCode || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[96px] items-center justify-center rounded-[6px] border border-zinc-200 bg-zinc-50 px-4">
            {logoUrl && failedLogoUrl !== logoUrl ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="max-h-16 max-w-[185px] object-contain"
                onError={() => setFailedLogoUrl(logoUrl)}
              />
            ) : (
              <span className="text-center text-xs font-semibold text-zinc-400">
                {fallbackText.logoUnavailable}
              </span>
            )}
          </div>
        </div>

        <div className="mt-10 h-px bg-[#141442]/14" />

        <div className="mt-9 grid grid-cols-[1fr_230px] gap-10">
          <div>
            <h3 className="text-[30px] font-semibold uppercase leading-tight tracking-[-0.035em] text-[#080832]">
              It&apos;s time to reconnect...
            </h3>

            <div className="mt-6 space-y-4 text-[15px] font-medium leading-6 text-[#141442]/82">
              <p>
                Integrated Systems Europe is the world-renowned annual tech show for the systems integration and audiovisual industry.
              </p>

              <p>
                Join us in Barcelona and reconnect with innovation, people, knowledge and technology.
              </p>

              <p>
                Register for free using your exhibitor invitation code and secure your visitor pass for ISE {EVENT_YEAR}.
              </p>
            </div>

            <div className="mt-9">
              <p className="text-[18px] font-semibold leading-tight text-[#00a6d6]">
                Join us for FREE and save with your invitation code:
              </p>

              <p className="mt-2 break-all text-[26px] font-semibold leading-none tracking-[-0.035em] text-[#080832]">
                {invitationCode || '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-start">
            <div className="relative flex h-[255px] w-[255px] items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#141442]/28" />
              <div className="absolute h-[210px] w-[210px] rounded-full bg-gradient-to-br from-[#00d9ff] via-[#0a5cff] to-[#1b1464]" />

              <div className="relative flex h-[196px] w-[196px] flex-col items-center justify-center rounded-full bg-[#080832] p-5 text-center text-white shadow-[0_22px_55px_rgba(8,8,50,0.32)]">
                <p className="text-[12px] font-semibold uppercase leading-tight tracking-[0.22em]">
                  {fallbackText.saveTicket}
                </p>

                <div className="mt-3 rounded-xl bg-white p-2.5">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Registration QR code"
                      className="h-[92px] w-[92px] object-contain"
                    />
                  ) : (
                    <div className="flex h-[92px] w-[92px] items-center justify-center text-[10px] font-semibold text-zinc-400">
                      {fallbackText.qrUnavailable}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#141442]/55">
              {fallbackText.scanToRegister}
            </p>

            <p className="mt-2 max-w-[230px] break-all text-center text-[11px] font-medium leading-snug text-[#141442]/45">
              {registrationUrl || fallbackText.registrationUrlUnavailable}
            </p>
          </div>
        </div>

        <div className="mt-11 h-px bg-[#141442]/14" />

        <div className="mt-8 flex items-end justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#141442]/50">
              A joint venture partnership of
            </p>

            <div className="mt-4 flex items-center gap-4 text-[22px] font-semibold text-[#141442]/55">
              <span>AVIXA</span>
              <span className="text-[#f05a28]">CEDIA</span>
            </div>
          </div>

          <div className="text-right text-xs leading-5 text-[#141442]/45" />
        </div>
      </section>
    </div>
  )
}
