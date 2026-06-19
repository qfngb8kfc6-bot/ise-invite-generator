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
}

const EVENT_YEAR = process.env.NEXT_PUBLIC_EVENT_YEAR?.trim() || '2027'

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
        bodyOne: 'Integrated Systems Europe is the world-renowned annual tech show for the systems integration and audiovisual industry.',
        bodyTwo: 'Join us in Barcelona and reconnect with innovation, people, knowledge and technology.',
        bodyThree: `Register for free using your exhibitor invitation code and secure your visitor pass for ISE ${eventYear}.`,
        freeCode: 'Join us for FREE and save with your invitation code:',
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
}: InvitePreviewProps) {
  const selectedTheme = themes[theme] ?? themes.audio
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
    <div className="h-[780px] w-[980px] overflow-hidden rounded-[18px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
      <section
        className="relative h-[315px] overflow-hidden bg-[#06194c] px-12 py-9 text-white"
        style={{
          backgroundImage: `url(${selectedTheme.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#06194c]/96 via-[#06194c]/74 to-[#06194c]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(34,211,238,0.22),transparent_34%)]" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-8">
            <img
              src={ISE_LOGO_WHITE}
              alt="Integrated Systems Europe"
              className="h-[78px] w-auto object-contain"
            />

            <div className="text-right text-[13px] font-semibold leading-tight text-white/85">
              <div>Fira de Barcelona | Gran Via</div>
              <div>3 - 6 February {EVENT_YEAR}</div>
            </div>
          </div>

          <div className="max-w-[720px]">
            <p className="text-[17px] font-medium text-white/86">
              {cardCopy.joinUs}
            </p>

            <h2 className="mt-3 text-[62px] font-semibold uppercase leading-[0.88] tracking-[-0.055em] text-white">
              {cardCopy.invitationTitle}
            </h2>
          </div>
        </div>
      </section>

      <section className="h-[465px] bg-white px-12 py-9 text-[#141442]">
        <div className="grid h-full grid-cols-[1fr_270px] gap-10">
          <div className="flex min-w-0 flex-col">
            <div className="min-w-0">
              <h3 className="max-w-[590px] break-words text-[30px] font-black uppercase leading-[0.95] tracking-[-0.055em] text-[#080832]">
                {companyName || fallbackText.companyName}
              </h3>

              <p className="mt-2 text-[16px] font-semibold leading-tight text-[#141442]/78">
                {cardCopy.isInviting}
              </p>
            </div>

            <div className="mt-7">
              <h3 className="text-[25px] font-semibold uppercase leading-tight tracking-[-0.035em] text-[#080832]">
                {cardCopy.reconnectHeadline}
              </h3>

              <div className="mt-5 space-y-3 text-[14px] font-medium leading-[1.55] text-[#141442]/82">
                <p>
                  {cardCopy.bodyOne}
                </p>

                <p>
                  {cardCopy.bodyTwo}
                </p>

                <p>
                  {cardCopy.bodyThree}
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="whitespace-nowrap text-[15px] font-semibold leading-tight text-[#00a6d6]">
                {cardCopy.freeCode}
              </p>

              <p className="mt-2 break-all text-[25px] font-semibold leading-none tracking-[-0.035em] text-[#080832]">
                {invitationCode || '—'}
              </p>

              <img
                src="/branding/toolkit/ise-partners-footer.png?v=20270619"
                alt="A joint venture partnership of AVIXA and CEDIA"
                className="mt-5 h-auto w-[210px] object-contain"
              />
            </div>
          </div>

          <div className="flex w-[270px] flex-col items-center justify-center">
            <div className="mb-5 flex flex-col items-center">
              <div className="flex min-h-[78px] w-[205px] items-center justify-center rounded-[6px] border border-zinc-200 bg-zinc-50 px-4">
                {logoUrl && failedLogoUrl !== logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${companyName} logo`}
                    className="max-h-12 max-w-[172px] object-contain"
                    onError={() => setFailedLogoUrl(logoUrl)}
                  />
                ) : (
                  <span className="text-center text-[11px] font-semibold text-zinc-400">
                    {fallbackText.logoUnavailable}
                  </span>
                )}
              </div>

              <div className="mt-3 w-[205px] text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#141442]/38">
                  {hasMultipleBooths ? fallbackText.booths : fallbackText.booth}
                </p>
                <p className="mt-1 break-words text-[16px] font-bold leading-tight text-[#080832]">
                  {boothDisplay || '—'}
                </p>
              </div>
            </div>

            <p className="mb-3 w-[270px] text-center text-[13px] font-semibold uppercase leading-snug tracking-[0.2em] text-[#141442]/70">
              {fallbackText.saveTicket}
            </p>

            <div className="relative flex h-[210px] w-[210px] items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#141442]/20" />
              <div className="absolute h-[192px] w-[192px] rounded-full border border-[#141442]/10" />
              <div className="absolute h-[176px] w-[176px] rounded-full bg-gradient-to-br from-[#00d9ff] via-[#0a5cff] to-[#1b1464] shadow-[0_18px_42px_rgba(10,92,255,0.22)]" />

              <div className="relative flex h-[154px] w-[154px] items-center justify-center rounded-full bg-[#080832] text-center text-white shadow-[0_22px_55px_rgba(8,8,50,0.34)]">
                <div className="rounded-2xl bg-white p-2.5 shadow-[0_8px_22px_rgba(255,255,255,0.16)]">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Registration QR code"
                      className="h-[86px] w-[86px] object-contain"
                    />
                  ) : (
                    <div className="flex h-[86px] w-[86px] items-center justify-center text-[10px] font-semibold text-zinc-400">
                      {fallbackText.qrUnavailable}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#141442]/60">
              {fallbackText.scanToRegister}
            </p>
          </div>
        </div>
      </section>
    </div>
  )

}
