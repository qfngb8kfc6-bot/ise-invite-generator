'use client'

import { useEffect, useMemo, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { translations } from '@/lib/translations'
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
    case 'pt':
      return { logoUnavailable: 'Logótipo indisponível', companyName: 'Nome da empresa', booth: 'Número do stand', booths: 'Números dos stands', invitationCode: 'Código de convite', qrUnavailable: 'QR indisponível', scanToRegister: 'Digitalize para se registar', registrationUrlUnavailable: 'URL de registo indisponível', freePass: 'Passe gratuito de visitante', saveTicket: 'Garanta o seu bilhete gratuito', headline: 'O seu convite para ISE' }
    case 'nl':
      return { logoUnavailable: 'Logo niet beschikbaar', companyName: 'Bedrijfsnaam', booth: 'Standnummer', booths: 'Standnummers', invitationCode: 'Uitnodigingscode', qrUnavailable: 'QR niet beschikbaar', scanToRegister: 'Scan om te registreren', registrationUrlUnavailable: 'Registratie-URL niet beschikbaar', freePass: 'Gratis bezoekerspas', saveTicket: 'Claim uw gratis ticket', headline: 'Uw uitnodiging voor ISE' }
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
    case 'pt':
      return {
        joinUs: `Junte-se a nós na ISE ${eventYear}`,
        invitationTitle: 'Convite',
        isInviting: `convida-o para a ISE ${eventYear}`,
        reconnectHeadline: 'Está na hora de reconectar...',
        bodyOne: 'A Integrated Systems Europe é o evento tecnológico anual de referência mundial para integração de sistemas e indústria audiovisual.',
        bodyTwo: 'Junte-se a nós em Barcelona e reconecte-se com inovação, pessoas, conhecimento e tecnologia.',
        bodyThree: `Registe-se gratuitamente com o seu código de convite de expositor e garanta o seu passe de visitante para a ISE ${eventYear}.`,
        freeCode: 'Junte-se gratuitamente usando o seu código de convite:',
      }
    case 'nl':
      return {
        joinUs: `Bezoek ons op ISE ${eventYear}`,
        invitationTitle: 'Uitnodiging',
        isInviting: `nodigt u uit voor ISE ${eventYear}`,
        reconnectHeadline: 'Tijd om opnieuw te verbinden...',
        bodyOne: 'Integrated Systems Europe is de wereldwijd toonaangevende jaarlijkse technologiebeurs voor systeemintegratie en de audiovisuele industrie.',
        bodyTwo: 'Kom naar Barcelona en verbind opnieuw met innovatie, mensen, kennis en technologie.',
        bodyThree: `Registreer gratis met uw exposanten-uitnodigingscode en verzeker uw bezoekerspas voor ISE ${eventYear}.`,
        freeCode: 'Neem gratis deel met uw uitnodigingscode:',
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

  const text = translations[language].invite
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
    <div className="w-[820px] overflow-hidden rounded-[18px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
      <section
        className="relative h-[430px] overflow-hidden bg-[#06194c] px-12 py-10 text-white"
        style={{
          backgroundImage: `url(${selectedTheme.backgroundImage})`,
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
              className="h-[88px] w-auto object-contain"
            />

            <div className="text-right text-[13px] font-semibold leading-tight text-white/85">
              <div>Fira de Barcelona | Gran Via</div>
              <div>3 - 6 February {EVENT_YEAR}</div>
            </div>
          </div>

          <div className="max-w-[620px]">
            <p className="text-[17px] font-medium text-white/86">
              {cardCopy.joinUs}
            </p>

            <h2 className="mt-4 text-[76px] font-semibold uppercase leading-[0.9] tracking-[-0.055em] text-white">
              {cardCopy.invitationTitle}
            </h2>
          </div>
        </div>
      </section>

      <section className="min-h-[610px] bg-white px-12 py-10 text-[#141442]">
        <div className="grid grid-cols-[1fr_260px] gap-8">
          <div className="min-w-0">
            <h3 className="max-w-[520px] break-words text-[28px] font-black uppercase leading-[0.95] tracking-[-0.055em] text-[#080832]">
              {companyName || fallbackText.companyName}
            </h3>

            <p className="mt-2 text-[17px] font-semibold leading-tight text-[#141442]/78">
              {cardCopy.isInviting}
            </p>

            <div className="mt-5 grid max-w-[520px] grid-cols-1 gap-5">
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

          <div className="flex w-[260px] flex-col items-center">
            <div className="flex min-h-[96px] w-[210px] items-center justify-center rounded-[6px] border border-zinc-200 bg-zinc-50 px-4">
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

            <div className="mt-4 w-[210px] text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#141442]/38">
                {hasMultipleBooths ? fallbackText.booths : fallbackText.booth}
              </p>
              <p className="mt-1 break-words text-[18px] font-bold leading-tight text-[#080832]">
                {boothDisplay || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-[1fr_260px] gap-10">
          <div>
            <h3 className="text-[30px] font-semibold uppercase leading-tight tracking-[-0.035em] text-[#080832]">
              {cardCopy.reconnectHeadline}
            </h3>

            <div className="mt-6 space-y-4 text-[15px] font-medium leading-6 text-[#141442]/82">
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

            <div className="mt-9">
              <p className="text-[18px] font-semibold leading-tight text-[#00a6d6]">
                {cardCopy.freeCode}
              </p>

              <p className="mt-2 break-all text-[26px] font-semibold leading-none tracking-[-0.035em] text-[#080832]">
                {invitationCode || '—'}
              </p>
            </div>
          </div>

          <div className="flex w-[260px] flex-col items-center justify-start">
            <p className="mb-4 w-[260px] text-center text-[13px] font-semibold uppercase leading-snug tracking-[0.2em] text-[#141442]/70">
              {fallbackText.saveTicket}
            </p>

            <div className="relative flex h-[260px] w-[260px] items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#141442]/20" />
              <div className="absolute h-[238px] w-[238px] rounded-full border border-[#141442]/10" />
              <div className="absolute h-[218px] w-[218px] rounded-full bg-gradient-to-br from-[#00d9ff] via-[#0a5cff] to-[#1b1464] shadow-[0_18px_42px_rgba(10,92,255,0.22)]" />

              <div className="relative flex h-[194px] w-[194px] items-center justify-center rounded-full bg-[#080832] text-center text-white shadow-[0_22px_55px_rgba(8,8,50,0.34)]">
                <div className="rounded-2xl bg-white p-2.5 shadow-[0_8px_22px_rgba(255,255,255,0.16)]">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Registration QR code"
                      className="h-[104px] w-[104px] object-contain"
                    />
                  ) : (
                    <div className="flex h-[104px] w-[104px] items-center justify-center text-[10px] font-semibold text-zinc-400">
                      {fallbackText.qrUnavailable}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#141442]/60">
              {fallbackText.scanToRegister}
            </p>

            <p className="mt-2 max-w-[245px] break-all text-center text-[12px] font-medium leading-snug text-[#141442]/55">
              {registrationUrl || fallbackText.registrationUrlUnavailable}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <img
            src="/branding/toolkit/ise-partners-footer.png"
            alt="A joint venture partnership of AVIXA and CEDIA"
            className="h-auto w-[220px] object-contain"
          />
        </div>
      </section>
    </div>
  )
}
