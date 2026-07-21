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
      return { logoUnavailable: 'Logotipo no disponible', companyName: 'Nombre de la empresa', booth: 'Número de stand', booths: 'Números de stand', invitationCode: 'Código de invitación', qrUnavailable: 'QR no disponible', scanToRegister: 'Escanee para registrarse', registrationUrlUnavailable: 'URL de registro no disponible', freePass: 'Pase gratuito para visitantes', saveTicket: 'ENTRADA GRATUITA', headline: 'Su invitación a ISE', invitedLine: 'te ha invitado a ISE 2027', useCode: 'Usa el código:', inviteUrlPrefix: 'en', heroLineOne: 'TU INVITACIÓN.', heroLineTwo: 'NUESTRA CELEBRACIÓN.', save250LineOne: 'AHORRA 250 €', save250LineTwo: 'Y CONSIGUE HOY', save250LineThree: 'TU ENTRADA', save250LineFour: 'GRATUITA' }

    case 'fr':
      return { logoUnavailable: 'Logo indisponible', companyName: 'Nom de l’entreprise', booth: 'Numéro de stand', booths: 'Numéros de stand', invitationCode: 'Code d’invitation', qrUnavailable: 'QR indisponible', scanToRegister: 'Scanner pour s’inscrire', registrationUrlUnavailable: 'URL d’inscription indisponible', freePass: 'Pass visiteur gratuit', saveTicket: 'BILLET GRATUIT', headline: 'Votre invitation à ISE', invitedLine: 'vous a invité à ISE 2027', useCode: 'Utilisez le code :', inviteUrlPrefix: 'sur', heroLineOne: 'VOTRE INVITATION.', heroLineTwo: 'NOTRE CÉLÉBRATION.', save250LineOne: 'ÉCONOMISEZ 250 €', save250LineTwo: 'ET OBTENEZ', save250LineThree: 'VOTRE BADGE GRATUIT', save250LineFour: 'DÈS AUJOURD’HUI' }

    case 'de':
      return { logoUnavailable: 'Logo nicht verfügbar', companyName: 'Firmenname', booth: 'Standnummer', booths: 'Standnummern', invitationCode: 'Einladungscode', qrUnavailable: 'QR nicht verfügbar', scanToRegister: 'Zum Registrieren scannen', registrationUrlUnavailable: 'Registrierungs-URL nicht verfügbar', freePass: 'Kostenloser Besucherpass', saveTicket: 'KOSTENLOSES TICKET', headline: 'Ihre Einladung zur ISE', invitedLine: 'hat Sie zur ISE 2027 eingeladen', useCode: 'Registrieren Sie sich mit dem Code:', inviteUrlPrefix: 'unter', heroLineOne: 'IHRE EINLADUNG.', heroLineTwo: 'UNSERE FEIER.', save250LineOne: 'SPAREN SIE 250 €', save250LineTwo: 'SICHERN SIE SICH', save250LineThree: 'JETZT IHR KOSTENLOSES', save250LineFour: 'TICKET!' }

    case 'it':
      return { logoUnavailable: 'Logo non disponibile', companyName: 'Nome azienda', booth: 'Numero stand', booths: 'Numeri stand', invitationCode: 'Codice di invito', qrUnavailable: 'QR non disponibile', scanToRegister: 'Scansiona per registrarti', registrationUrlUnavailable: 'URL di registrazione non disponibile', freePass: 'Pass visitatore gratuito', saveTicket: 'BIGLIETTO GRATUITO', headline: 'Il tuo invito a ISE', invitedLine: 'ti ha invitato a ISE 2027', useCode: 'Usa il codice:', inviteUrlPrefix: 'su', heroLineOne: 'OLTRE L’INVITO.', heroLineTwo: 'LA GRANDE CELEBRAZIONE.', save250LineOne: 'RISPARMIA 250 €', save250LineTwo: 'ED ASSICURATI OGGI', save250LineThree: 'IL TUO', save250LineFour: 'BIGLIETTO' }

    case 'zh-CN':
      return { logoUnavailable: '暂无标志', companyName: '公司名称', booth: '展位号', booths: '展位号', invitationCode: '邀请码', qrUnavailable: '二维码不可用', scanToRegister: '扫码注册', registrationUrlUnavailable: '注册链接不可用', freePass: '免费观众通行证', saveTicket: '免费门票', headline: '您的 ISE 邀请函', invitedLine: '邀请您参加 ISE 2027', useCode: '使用邀请码：', inviteUrlPrefix: '访问', heroLineOne: '您的邀请。', heroLineTwo: '我们的庆典。', save250LineOne: '节省 250 欧元', save250LineTwo: '并立即获取', save250LineThree: '您的免费', save250LineFour: '门票' }

    default:
      return { logoUnavailable: 'Logo unavailable', companyName: 'Company name', booth: 'Stand number/s', booths: 'Stand number/s', invitationCode: 'Invitation code', qrUnavailable: 'QR unavailable', scanToRegister: 'Scan to register', registrationUrlUnavailable: 'Registration URL unavailable', freePass: 'Free visitor pass', saveTicket: 'FREE TICKET', headline: 'Your invitation to ISE', invitedLine: 'has invited you to ISE 2027', useCode: 'Use code:', inviteUrlPrefix: 'at', heroLineOne: 'YOUR INVITATION.', heroLineTwo: 'OUR CELEBRATION.', save250LineOne: 'SAVE €250', save250LineTwo: 'AND SECURE', save250LineThree: 'YOUR FREE TICKET', save250LineFour: 'TODAY' }
  }
}



function getCardCopy(language: LanguageKey, eventYear: string) {
  switch (language) {
    case 'es':
      return {
        reconnectHeadline: 'TU INVITACIÓN. NUESTRA CELEBRACIÓN.',
        bodyOne: 'Vuelve el salón tecnológico anual de referencia mundial.',
        bodyTwo: 'Las innovaciones más recientes del mundo.',
        bodyThree: 'Los grandes referentes de la innovación.',
        bodyFour: `ISE ${eventYear} reunirá todo esto —y mucho más— en su mejor edición hasta la fecha. Encontrarás:`,
        bullets: ['Start-ups brillantes y propuestas espectaculares', 'Creadores de contenido e integradores expertos', 'Aulas de nueva generación y auditorios de otro nivel', 'Y mucho más entre medias'],
        closingOne: 'Prepárate para verlo todo, en todos los sectores y desde todos los horizontes. Nada menos que todo.',
        closingTwo: 'Porque te espera un mundo de oportunidades…',
        freeCode: 'Ahorra 250 € y consigue hoy tu entrada gratuita',
      }

    case 'fr':
      return {
        reconnectHeadline: 'VOTRE INVITATION. NOTRE CÉLÉBRATION.',
        bodyOne: 'Le salon technologique annuel incontournable est de retour.',
        bodyTwo: 'Les dernières innovations.',
        bodyThree: 'Les plus grands acteurs du secteur.',
        bodyFour: `ISE ${eventYear} s'annonce comme l'édition la plus ambitieuse jamais organisée, réunissant tout ce qui façonne l'avenir de l'audiovisuel et des technologies intégrées. Au programme :`,
        bullets: ['Des start-ups prometteuses et des démonstrations spectaculaires', 'Des créateurs de contenu visionnaires et des spécialistes de l’intégration', 'Des salles de cours et des salles de spectacle nouvelle génération', 'Et bien plus encore !'],
        closingOne: 'Tous les secteurs. Tous les horizons. Toute l’innovation réunie en un seul lieu.',
        closingTwo: 'Un monde d’opportunités vous attend.',
        freeCode: 'Économisez 250 € et obtenez votre badge gratuit dès aujourd’hui',
      }

    case 'de':
      return {
        reconnectHeadline: 'IHRE EINLADUNG. UNSERE FEIER.',
        bodyOne: 'Die weltweit führende Messe für audiovisuelle Technologien und Systemintegration ist zurück.',
        bodyTwo: 'Die neuesten Technologien der Welt.',
        bodyThree: 'Die größten Innovatoren der Welt.',
        bodyFour: `Die ISE ${eventYear} bringt sie alle zusammen – und verspricht, alle bisherigen Erwartungen zu übertreffen. Bereit für die ganz große Show?`,
        bullets: ['Aufstrebende Start-ups und renommierte Marktführer', 'Kreative Content-Creator und versierte Integratoren', 'Vom Klassenzimmer der Next-Gen bis zu Konzerthallen auf Next-Level-Niveau', 'und noch so vieles mehr!'],
        closingOne: 'Erleben Sie Ihre eigene und alle angrenzenden Branchen aus völlig neuen Blickwinkeln.',
        closingTwo: 'Keine Kompromisse – weil eine Welt voller Chancen auf Sie wartet…',
        freeCode: 'Sparen Sie 250 € – sichern Sie sich jetzt Ihr kostenloses Ticket!',
      }

    case 'it':
      return {
        reconnectHeadline: 'OLTRE L’INVITO. LA GRANDE CELEBRAZIONE.',
        bodyOne: 'Il rinomato appuntamento annuale con la tecnologia è tornato.',
        bodyTwo: `ISE ${eventYear} si prepara a riunire l'intero settore per dare vita a un'edizione che supererà ogni record. Ecco cosa ti aspetta:`,
        bodyThree: '',
        bodyFour: '',
        bullets: ['Startup brillanti e innovazioni mozzafiato', 'Creatori di contenuti creativi ed esperti integratori di sistemi', 'Aule high-tech e palcoscenici mai visti prima', '...e tantissimo altro ancora.'],
        closingOne: 'Aspettati una panoramica completa di ogni mercato e settore. Nient’altro che il meglio.',
        closingTwo: 'Perché un mondo di opportunità ti sta aspettando…',
        freeCode: 'Risparmia 250 € ed assicurati oggi il tuo biglietto',
      }

    case 'zh-CN':
      return {
        reconnectHeadline: '您的邀请。我们的庆典。',
        bodyOne: '世界知名的年度科技展即将回归。',
        bodyTwo: '全球最新创新。',
        bodyThree: '世界领先创新者。',
        bodyFour: `ISE ${eventYear} 将汇聚这一切，带来迄今为止最精彩的一届。您将看到：`,
        bullets: ['充满活力的初创企业和大胆的展示', '创意内容制作者和专业集成商', '新一代教室和高水平演出场馆', '以及更多精彩内容'],
        closingOne: '期待来自每个领域、每个方向的机会。',
        closingTwo: '因为一个充满机会的世界正在等待您…',
        freeCode: '立即节省 250 欧元并获取您的免费门票',
      }

    default:
      return {
        reconnectHeadline: 'YOUR INVITATION. OUR CELEBRATION.',
        bodyOne: 'The world-renowned annual tech show is back.',
        bodyTwo: 'The world’s latest innovations.',
        bodyThree: 'The world’s greatest innovators.',
        bodyFour: `ISE ${eventYear} is set to bring it all together for its best edition yet. You’ll find:`,
        bullets: ['Bright start-ups and bold showstoppers', 'Creative content makers and expert integrators', 'Next-gen classrooms and next-level concert halls', 'and a whole lot more in between'],
        closingOne: '{cardCopy.closingOne}',
        closingTwo: 'Because a world of opportunity awaits…',
        freeCode: 'Save €250 and secure your free ticket today',
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
  const isSaveTheDateTheme = theme === 'iseBrandingTwo'

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
        className="relative h-[500px] overflow-hidden bg-[#06194c] px-12 py-9 text-white"
        style={{
          backgroundImage: `url("${selectedTheme.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0 bg-black/12" />

        {isSaveTheDateTheme ? (
          <>
            <img
              src={ISE_LOGO_WHITE}
              alt="Integrated Systems Europe"
              className="absolute left-1/2 top-[34px] h-[58px] w-auto -translate-x-1/2 object-contain"
            />

            <h2 className="absolute left-1/2 top-[140px] w-full -translate-x-1/2 text-center text-[66px] font-semibold uppercase leading-[1.02] tracking-[0em] text-white">
              SAVE<br />
              THE DATE
            </h2>

            <p className="absolute left-1/2 top-[325px] w-full -translate-x-1/2 text-center text-[20px] font-semibold leading-none tracking-[0em] text-white">
              2 - 5 Feb {EVENT_YEAR} <span className="px-4">|</span> Fira de Barcelona, Gran Via
            </p>

            <img
              src="/branding/toolkit/ise-partners-footer-transparent.png?v=20270623"
              alt="A joint venture partnership of AVIXA and CEDIA"
              className="absolute bottom-[46px] left-1/2 z-30 h-auto w-[230px] max-w-none -translate-x-1/2 object-contain opacity-100"
            />
          </>
        ) : (
          <>
            <div className="relative flex h-full flex-col items-center px-6 pb-[44px] text-center">
              <img
                src={ISE_LOGO_WHITE}
                alt="Integrated Systems Europe"
                className="mt-[18px] h-[56px] w-auto object-contain"
              />

              <p className="mt-[30px] text-[19px] font-black uppercase leading-none tracking-[-0.018em] text-white">
                ISE {EVENT_YEAR}: WHEN WORLDS UNITE
              </p>

              <h2 className="mt-[20px] text-[65px] font-semibold uppercase leading-[0.98] tracking-[0em] text-white">
                {fallbackText.heroLineOne}<br />
                {fallbackText.heroLineTwo}
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
          </>
        )}
      </section>

      <section className="h-[710px] bg-white px-12 py-10 text-[#050b36]">
        <div className="flex items-start justify-between gap-5 border-b border-[#050b36]/80 pb-5">
          <div className="min-w-0 w-[470px] max-w-[470px]">
            <h3
              className="max-h-[82px] overflow-hidden break-words pt-[3px] font-semibold uppercase leading-[1.02] tracking-[0em] text-[#050b36]"
              style={{
                fontSize:
                  (companyName || fallbackText.companyName).length > 70
                    ? '18px'
                    : (companyName || fallbackText.companyName).length > 58
                      ? '20px'
                      : (companyName || fallbackText.companyName).length > 46
                        ? '23px'
                        : (companyName || fallbackText.companyName).length > 34
                          ? '28px'
                          : '36px',
              }}
            >
              {companyName || fallbackText.companyName}
            </h3>

            <p className="mt-2 text-[18px] font-medium leading-tight text-[#050b36]">
                {fallbackText.invitedLine}
              </p>
          </div>

          <div className="flex min-h-[76px] w-[230px] items-center justify-center border border-[#050b36]/35 bg-white px-5">
            {logoUrl && failedLogoUrl !== logoUrl ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="max-h-14 max-w-[190px] object-contain"
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

        <div className="grid h-[540px] grid-cols-[minmax(0,1fr)_300px] gap-11 pt-9">
          <div className="min-w-0">
            <h3 className="max-w-[600px] text-[52px] font-semibold uppercase leading-[1.02] tracking-[0em] text-[#050b36]">
              {language === 'en' ? (
                <>
                  {cardCopy.reconnectHeadline}
                </>
              ) : (
                cardCopy.reconnectHeadline
              )}
            </h3>

            {language === 'en' ? (
              <div className="mt-10 max-w-[640px] space-y-4 text-[16px] font-medium leading-[1.5] text-[#050b36]">
                <p className="font-semibold">
                  {cardCopy.bodyOne}
                </p>

                <p>
                  The world’s latest innovations. The world’s greatest innovators.
                </p>

                <p>
                  {cardCopy.bodyFour}
                </p>

                <ul className="space-y-1">
                  {cardCopy.bullets.map((item) => (
                    <li key={item}>– {item}</li>
                  ))}
                </ul>

                <p>
                  So expect every vertical from every horizon. Nothing but <span className="italic">everything.</span>
                </p>

                <p className="font-semibold">
                  {cardCopy.closingTwo}
                </p>
              </div>
            ) : (
              <div className="mt-10 max-w-[640px] space-y-4 text-[16px] font-medium leading-[1.5] text-[#050b36]">
                {cardCopy.bodyOne}
                <p>{isSaveTheDateTheme ? 'From start-ups to showstoppers, content creation to integration, and classrooms to concert halls, expect nothing but EVERYTHING.' : [cardCopy.bodyTwo, cardCopy.bodyThree, cardCopy.bodyFour].filter(Boolean).join(' ')}</p>
                <p>{isSaveTheDateTheme ? 'Be our guest in Barcelona.' : [cardCopy.closingOne, cardCopy.closingTwo].filter(Boolean).join(' ')}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-start pt-0">
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
                  {cardCopy.freeCode}
                </p>
              </div>
            </div>

            <p className="mt-[46px] max-w-[245px] text-center text-[22px] font-semibold uppercase leading-[1.08] text-[#050b36]">
              {fallbackText.save250LineOne}<br />
              {fallbackText.save250LineTwo}<br />
              {fallbackText.save250LineThree}<br />
              {fallbackText.save250LineFour}
            </p>

            <p className="mt-[52px] text-center text-[17px] font-semibold leading-tight text-[#050b36]">
              {fallbackText.useCode} {invitationCode || 'XXX'}<br />
              {fallbackText.inviteUrlPrefix} iseurope.org/invite
            </p>
          </div>
        </div>
      </section>
    </div>
  )

}
