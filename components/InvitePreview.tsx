'use client'

import { useEffect, useMemo, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { themes } from '@/lib/themes'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type InvitePreviewProps = {
  companyName: string
  standNumber: string
  invitationCode: string
  logoUrl: string
  registrationUrl: string
  theme: ThemeKey
  language: LanguageKey
  mode?: 'primary' | 'secondary'
}

const EVENT_YEAR = process.env.NEXT_PUBLIC_EVENT_YEAR?.trim() || '2027'

const ISE_LOGO_WHITE = '/branding/ise-logo-white.png'
const ISE_QR_RINGS = '/branding/toolkit/ise-qr-rings.png?v=20270622'

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
    case 'ca':
      return { logoUnavailable: 'Logotip no disponible', companyName: "Nom de l'empresa", booth: "Número d'estand", booths: "Números d'estand", invitationCode: "Codi d'invitació", qrUnavailable: 'QR no disponible', scanToRegister: "Escaneja per registrar-te", registrationUrlUnavailable: "URL de registre no disponible", freePass: 'Passi gratuït de visitant', saveTicket: 'ENTRADA GRATUÏTA', headline: 'La teva invitació a ISE' }
    case 'zh-CN':
      return { logoUnavailable: '暂无标志', companyName: '公司名称', booth: '展位号', booths: '展位号', invitationCode: '邀请码', qrUnavailable: '二维码不可用', scanToRegister: '扫码注册', registrationUrlUnavailable: '注册链接不可用', freePass: '免费观众通行证', saveTicket: '领取您的免费门票', headline: '您的 ISE 邀请函' }
    default:
      return { logoUnavailable: 'Logo unavailable', companyName: 'Company name', booth: 'Stand number/s', booths: 'Stand number/s', invitationCode: 'Invitation code', qrUnavailable: 'QR unavailable', scanToRegister: 'Scan to register', registrationUrlUnavailable: 'Registration URL unavailable', freePass: 'Free visitor pass', saveTicket: 'FREE TICKET', headline: 'Your invitation to ISE' }
  }
}

function getCardCopy(language: LanguageKey, eventYear: string) {
  switch (language) {
    case 'es':
      return {
        joinUs: `Únase a nosotros en ISE ${eventYear}`,
        invitationTitle: 'Invitación',
        isInviting: `le invita a ISE ${eventYear}`,
        reconnectHeadline: 'Es hora de reconectar...',
        bodyOne: 'Integrated Systems Europe es el evento tecnológico anual de referencia mundial para la integración de sistemas y la industria audiovisual.',
        bodyTwo: 'Únase a nosotros en Barcelona y reconecte con la innovación, las personas, el conocimiento y la tecnología.',
        bodyThree: `Regístrese gratis con su código de invitación de expositor y asegure su pase de visitante para ISE ${eventYear}.`,
        freeCode: 'Únase gratis y ahorre con su código de invitación:',
      }
    case 'de':
      return {
        joinUs: `Besuchen Sie uns auf der ISE ${eventYear}`,
        invitationTitle: 'Einladung',
        isInviting: `lädt Sie zur ISE ${eventYear} ein`,
        reconnectHeadline: 'Es ist Zeit, sich wieder zu vernetzen...',
        bodyOne: 'Integrated Systems Europe ist die weltweit führende jährliche Technologiemesse für Systemintegration und die audiovisuelle Branche.',
        bodyTwo: 'Kommen Sie nach Barcelona und vernetzen Sie sich wieder mit Innovation, Menschen, Wissen und Technologie.',
        bodyThree: `Registrieren Sie sich kostenlos mit Ihrem Aussteller-Einladungscode und sichern Sie sich Ihren Besucherausweis für ISE ${eventYear}.`,
        freeCode: 'Kostenlos teilnehmen und mit Ihrem Einladungscode sparen:',
      }
    case 'fr':
      return {
        joinUs: `Rejoignez-nous à ISE ${eventYear}`,
        invitationTitle: 'Invitation',
        isInviting: `vous invite à ISE ${eventYear}`,
        reconnectHeadline: 'Il est temps de se reconnecter...',
        bodyOne: 'Integrated Systems Europe est le salon technologique annuel de référence mondiale pour l’intégration de systèmes et l’industrie audiovisuelle.',
        bodyTwo: 'Rejoignez-nous à Barcelone et reconnectez-vous à l’innovation, aux personnes, au savoir et à la technologie.',
        bodyThree: `Inscrivez-vous gratuitement avec votre code d’invitation exposant et obtenez votre pass visiteur pour ISE ${eventYear}.`,
        freeCode: 'Rejoignez-nous gratuitement avec votre code d’invitation :',
      }
    case 'it':
      return {
        joinUs: `Unisciti a noi a ISE ${eventYear}`,
        invitationTitle: 'Invito',
        isInviting: `ti invita a ISE ${eventYear}`,
        reconnectHeadline: 'È tempo di riconnettersi...',
        bodyOne: 'Integrated Systems Europe è il principale evento tecnologico annuale al mondo per l’integrazione dei sistemi e il settore audiovisivo.',
        bodyTwo: 'Unisciti a noi a Barcellona e riconnettiti con innovazione, persone, conoscenza e tecnologia.',
        bodyThree: `Registrati gratuitamente con il tuo codice invito espositore e assicurati il pass visitatore per ISE ${eventYear}.`,
        freeCode: 'Partecipa gratis usando il tuo codice invito:',
      }
    case 'ca':
      return {
        joinUs: `Uneix-te a nosaltres a ISE ${eventYear}`,
        invitationTitle: 'Invitació',
        isInviting: `et convida a ISE ${eventYear}`,
        reconnectHeadline: 'És hora de reconnectar...',
        bodyOne: 'Integrated Systems Europe és el saló tecnològic anual de referència mundial per a la integració de sistemes i la indústria audiovisual.',
        bodyTwo: 'Uneix-te a nosaltres a Barcelona i reconnecta amb la innovació, les persones, el coneixement i la tecnologia.',
        bodyThree: `Registra't gratis amb el teu codi d'invitació d'expositor i assegura el teu passi de visitant per a ISE ${eventYear}.`,
        freeCode: "Uneix-te gratis i estalvia amb el teu codi d'invitació:",
      }
    case 'zh-CN':
      return {
        joinUs: `欢迎参加 ISE ${eventYear}`,
        invitationTitle: '邀请函',
        isInviting: `诚邀您参加 ISE ${eventYear}`,
        reconnectHeadline: '是时候重新连接...',
        bodyOne: 'Integrated Systems Europe 是全球知名的年度科技展会，面向系统集成和视听行业。',
        bodyTwo: '欢迎来到巴塞罗那，与创新、人脉、知识和技术重新连接。',
        bodyThree: `使用您的参展商邀请码免费注册，并获取 ISE ${eventYear} 观众通行证。`,
        freeCode: '使用您的邀请码免费参加：',
      }
    default:
      return {
        joinUs: `Join us at ISE ${eventYear}`,
        invitationTitle: 'Invitation',
        isInviting: `is inviting you to ISE ${eventYear}`,
        reconnectHeadline: 'It’s time to reconnect...',
        bodyOne: 'The world-renowned annual tech show is back.',
        bodyTwo: "The world’s latest innovations. The world’s greatest innovators.",
        bodyThree: `ISE ${eventYear} is set to bring it all together for its best edition yet. You’ll find:`,
        freeCode: 'Join us for FREE and save €250 with your invitation code:',
      }
  }
}

export default function InvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  registrationUrl,
  theme,
  language,
  mode = 'primary',
}: InvitePreviewProps) {
  const selectedTheme = themes[theme] ?? themes.audio
  const isSecondaryMode = mode === 'secondary'
  const [failedLogoUrl, setFailedLogoUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const fallbackText = getFallbackInviteText(language)
  const cardCopy = getCardCopy(language, EVENT_YEAR)

  const boothList = useMemo(() => {
    return standNumber
      .split(/[;,]/)
      .map((value) => value.trim())
      .filter(Boolean)
  }, [standNumber])

  const hasMultipleBooths = boothList.length > 1
  const boothDisplay = boothList.join(' · ')
  const detailLabel = isSecondaryMode
    ? 'Invitation ID'
    : hasMultipleBooths
      ? fallbackText.booths
      : fallbackText.booth

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
    <div className="w-[980px] overflow-hidden rounded-[18px] bg-white shadow-[0_28px_90px_rgba(2,6,23,0.42)] ring-1 ring-white/15">
      <section
        className="relative h-[430px] overflow-hidden bg-[#06194c] px-12 py-9 text-white"
        style={{
          backgroundImage: `url("${selectedTheme.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0 bg-black/12" />

        <div className="relative flex h-full flex-col items-center px-6 pb-[44px] text-center">
          <img
            src={ISE_LOGO_WHITE}
            alt="Integrated Systems Europe"
            className="mt-[18px] h-[56px] w-auto object-contain"
          />

          <p className="mt-[30px] text-[19px] font-black uppercase leading-none tracking-[-0.018em] text-white">
            ISE {EVENT_YEAR}: WHEN WORLDS UNITE
          </p>

          <h2 className="mt-[20px] text-[65px] font-semibold uppercase leading-[0.98] tracking-[-0.052em] text-white">
            YOUR INVITATION.<br />
            OUR CELEBRATION.
          </h2>

          <p className="mt-[18px] text-[19px] font-semibold leading-none tracking-[-0.025em] text-white">
            2 - 5 Feb {EVENT_YEAR} <span className="px-3">|</span> Fira de Barcelona, Gran Via
          </p>

        </div>

        <img
          src="/branding/toolkit/ise-partners-footer-transparent.png?v=20270623"
          alt="A joint venture partnership of AVIXA and CEDIA"
          className="absolute bottom-[14px] left-1/2 z-30 h-auto w-[250px] max-w-none -translate-x-1/2 object-contain opacity-100"
        />
      </section>

      <section className="h-[590px] bg-white px-12 py-9 text-[#050b36]">
        <div className="flex items-start justify-between gap-8 border-b border-[#050b36]/80 pb-5">
          <div className="min-w-0 max-w-[390px]">
            <h3
              className="overflow-hidden whitespace-nowrap font-semibold uppercase leading-none tracking-[-0.04em] text-[#050b36]"
              style={{
                fontSize:
                  (companyName || fallbackText.companyName).length > 42
                    ? '23px'
                    : (companyName || fallbackText.companyName).length > 34
                      ? '26px'
                      : (companyName || fallbackText.companyName).length > 28
                        ? '30px'
                        : '36px',
              }}
            >
              {companyName || fallbackText.companyName}
            </h3>

            <p className="mt-2 text-[18px] font-medium leading-tight text-[#050b36]">
              {isSecondaryMode
                ? `Has created your ISE ${EVENT_YEAR} invitation`
                : `Has invited you to ISE ${EVENT_YEAR}`}
            </p>
          </div>

          <div className="flex min-h-[76px] w-[250px] items-center justify-center border border-[#050b36]/35 bg-white px-5">
            {logoUrl && failedLogoUrl !== logoUrl ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="max-h-14 max-w-[210px] object-contain"
                onError={() => setFailedLogoUrl(logoUrl)}
              />
            ) : (
              <span className="text-center text-[16px] font-medium text-[#050b36]/70">
                Logo
              </span>
            )}
          </div>

          <div className="w-[175px] text-center">
            <p className="text-[19px] font-semibold leading-tight text-[#050b36]">
              {detailLabel}:
            </p>
            <p className="mt-1 break-words text-[18px] font-medium leading-tight text-[#050b36]">
              {boothDisplay || '000000'}
            </p>
          </div>
        </div>

        <div className="grid h-[445px] grid-cols-[minmax(0,1fr)_300px] gap-10 pt-7">
          <div className="min-w-0">
            <h3 className="max-w-[600px] text-[44px] font-semibold uppercase leading-[1.02] tracking-[-0.045em] text-[#050b36]">
              {language === 'en' ? (
                <>
                  BRING YOUR WORLD.<br />
                  UNITE WITH US.
                </>
              ) : (
                cardCopy.reconnectHeadline
              )}
            </h3>

            {language === 'en' ? (
              <div className="mt-8 max-w-[600px] space-y-3 text-[14px] font-medium leading-[1.42] text-[#050b36]">
                <p className="font-semibold">
                  The world-renowned annual tech show is back.
                </p>

                <p>
                  The world’s latest innovations. The world’s greatest innovators.
                </p>

                <p>
                  ISE {EVENT_YEAR} is set to bring it all together for its best edition yet. You’ll find:
                </p>

                <ul className="space-y-1">
                  <li>– Bright start-ups and bold showstoppers</li>
                  <li>– Creative content makers and expert integrators</li>
                  <li>– Next-gen classrooms and next-level concert halls</li>
                  <li>– And a whole lot more in between</li>
                </ul>

                <p>
                  So expect every vertical from every horizon. Nothing but <span className="italic">everything.</span>
                </p>

                <p className="font-semibold">
                  Because a world of opportunity awaits...
                </p>
              </div>
            ) : (
              <div className="mt-8 max-w-[600px] space-y-3 text-[14px] font-medium leading-[1.42] text-[#050b36]">
                <p>{cardCopy.bodyOne}</p>
                <p>{cardCopy.bodyTwo}</p>
                <p>{cardCopy.bodyThree}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-start pt-1">
            <div className="relative flex h-[210px] w-[210px] items-center justify-center">
              <img
                src={ISE_QR_RINGS}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 z-0 h-full w-full object-contain"
              />

              <div className="relative z-10 rounded-[10px] bg-white p-1">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Registration QR code"
                    className="h-[88px] w-[88px] object-contain"
                  />
                ) : (
                  <div className="flex h-[88px] w-[88px] items-center justify-center text-[9px] font-semibold text-zinc-400">
                    {fallbackText.qrUnavailable}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-center text-center">
                <p className="max-w-[126px] translate-y-[-88px] text-[20px] font-semibold uppercase leading-[1.08] text-[#050b36] opacity-0">
                  SAVE €250 AND SECURE YOUR FREE TICKET TODAY
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-[245px] text-center text-[22px] font-semibold uppercase leading-[1.08] text-[#050b36]">
              SAVE €250<br />
              AND SECURE<br />
              YOUR FREE<br />
              TICKET TODAY
            </p>

            <p className="mt-8 text-center text-[17px] font-semibold leading-tight text-[#050b36]">
              Use the code: {invitationCode || 'XXX'}<br />
              at iseurope.org/invite
            </p>
          </div>
        </div>
      </section>
    </div>
  )

}
