'use client'

import { useState } from 'react'
import { themes } from '@/lib/themes'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type LinkedInInvitePreviewProps = {
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
const ISE_PARTNERS_FOOTER =
  '/branding/toolkit/ise-partners-footer-transparent.png?v=20270623'

function getLinkedInText(language: LanguageKey) {
  switch (language) {
    case 'es':
      return {
        invitedLine: `te ha invitado a ISE ${EVENT_YEAR}`,
        headline: 'TU INVITACIÓN. NUESTRA CELEBRACIÓN.',
        ticket: 'AHORRA 250 € Y CONSIGUE HOY TU ENTRADA GRATUITA',
        useCode: 'Usa el código:',
        invitePrefix: 'en',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Número de stand',
      }
    case 'de':
      return {
        invitedLine: `hat Sie zur ISE ${EVENT_YEAR} eingeladen`,
        headline: 'IHRE EINLADUNG. UNSERE FEIER.',
        ticket: 'SPAREN SIE 250 € UND SICHERN SIE SICH JETZT IHR KOSTENLOSES TICKET',
        useCode: 'Registrieren Sie sich mit dem Code:',
        invitePrefix: 'unter',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Standnummer',
      }
    case 'fr':
      return {
        invitedLine: `vous a invité à ISE ${EVENT_YEAR}`,
        headline: 'VOTRE INVITATION. NOTRE CÉLÉBRATION.',
        ticket: 'ÉCONOMISEZ 250 € ET OBTENEZ VOTRE BADGE GRATUIT DÈS AUJOURD’HUI',
        useCode: 'Utilisez le code :',
        invitePrefix: 'sur',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Numéro de stand',
      }
    case 'it':
      return {
        invitedLine: `ti ha invitato a ISE ${EVENT_YEAR}`,
        headline: 'OLTRE L’INVITO. LA GRANDE CELEBRAZIONE.',
        ticket: 'RISPARMIA 250 € ED ASSICURATI OGGI IL TUO BIGLIETTO',
        useCode: 'Usa il codice:',
        invitePrefix: 'su',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Numero stand',
      }
    case 'zh-CN':
      return {
        invitedLine: `邀请您参加 ISE ${EVENT_YEAR}`,
        headline: '您的邀请。我们的庆典。',
        ticket: '节省 250 欧元并立即获取您的免费门票',
        useCode: '使用邀请码：',
        invitePrefix: '访问',
        inviteUrl: 'iseurope.org/invite',
        booth: '展位号',
      }
    default:
      return {
        invitedLine: `has invited you to ISE ${EVENT_YEAR}`,
        headline: 'YOUR INVITATION. OUR CELEBRATION.',
        ticket: 'SAVE €250 AND SECURE YOUR FREE TICKET TODAY',
        useCode: 'Use the code:',
        invitePrefix: 'at',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Booth number',
      }
  }
}

export default function LinkedInInvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  theme,
  language,
  mode = 'primary',
}: LinkedInInvitePreviewProps) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)

  const text = getLinkedInText(language)
  const isSaveTheDateTheme = theme === 'iseBrandingTwo'
  const selectedTheme = isSaveTheDateTheme
    ? themes.iseBrandingTwo
    : themes.iseBrandingOne
  const detailLabel = mode === 'secondary' ? 'Invitation ID' : text.booth
  const boothDisplay = standNumber?.trim() || '000000'
  const codeDisplay = invitationCode?.trim() || 'ISE2027'
  const companyDisplay = companyName?.trim() || 'BRAND NAME'

  return (
    <div className="relative h-[627px] w-[1200px] overflow-hidden bg-[#050b36] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("${selectedTheme.backgroundImage}")`,
        }}
      />

      <div className="absolute inset-0 bg-[#050b36]/22" />

      <img
        src={ISE_LOGO_WHITE}
        alt="Integrated Systems Europe"
        className="absolute left-[43px] top-[47px] h-auto w-[166px] object-contain"
      />

      <div className="absolute left-[258px] top-[54px] text-[16px] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
        <div>2 - 5 Feb {EVENT_YEAR}</div>
        <div>Fira de Barcelona, Gran Via</div>
      </div>

      <img
        src={ISE_PARTNERS_FOOTER}
        alt="A joint venture partnership of AVIXA and CEDIA"
        className="absolute left-[760px] top-[12px] h-auto w-[354px] object-contain"
      />

      <div className="absolute left-[42px] top-[155px] w-[395px]">
        <h2
          className="max-h-[58px] overflow-hidden break-words pt-[3px] font-semibold uppercase leading-[1.02] tracking-[0em] text-white"
          style={{
            fontSize:
              companyDisplay.length > 70
                ? '25px'
                : companyDisplay.length > 58
                  ? '28px'
                  : companyDisplay.length > 42
                    ? '34px'
                    : '43px',
          }}
        >
          {companyDisplay}
        </h2>

        <p className="mt-[4px] text-[21px] font-medium leading-[1.02] tracking-[-0.025em] text-white">
          {text.invitedLine}
        </p>
      </div>

      <div className="absolute left-[760px] top-[128px] flex h-[80px] w-[164px] items-center justify-center rounded-[10px] bg-white px-4">
        {logoUrl && failedLogoUrl !== logoUrl ? (
          <img
            src={logoUrl}
            alt={`${companyName} logo`}
            className="max-h-[58px] max-w-[132px] object-contain"
            onError={() => setFailedLogoUrl(logoUrl)}
          />
        ) : (
          <span className="text-[22px] font-medium tracking-[-0.03em] text-[#050b36]">
            Logo
          </span>
        )}
      </div>

      <div className="absolute left-[953px] top-[149px] w-[164px] text-center text-white">
        <p className="text-[20px] font-semibold leading-[1.02] tracking-[-0.035em]">
          {detailLabel}:
        </p>
        <p className="mx-auto mt-[4px] max-w-[135px] break-words text-center text-[17px] font-medium leading-[1.05] tracking-[-0.035em]">
          {boothDisplay}
        </p>
      </div>

      <div className="absolute left-[37px] top-[272px] h-px w-[1112px] bg-white/85" />

      <h1
        className="absolute left-[46px] top-[325px] w-[817px] whitespace-pre-line font-semibold uppercase leading-[0.91] tracking-[0em] text-white"
        style={{
          fontSize: isSaveTheDateTheme ? '70px' : '76px',
        }}
      >
        {isSaveTheDateTheme ? 'SAVE\nTHE DATE' : 'BRING\nYOUR WORLD.\nUNITE WITH US.'}
      </h1>

      <div className="absolute left-[845px] top-[370px] w-[286px] text-center text-white">
        <p className="text-[23px] font-semibold uppercase leading-[1.04] tracking-[-0.035em]">
          {text.ticket}
        </p>
      </div>

      <div className="absolute left-[891px] top-[468px] w-[185px] text-center text-[16px] font-medium leading-[1.04] tracking-[-0.03em] text-white">
        <div>{text.useCode}</div>
        <div className="mx-auto mt-[2px] max-w-[160px] break-words text-center font-semibold">
          {codeDisplay}
        </div>
        <div className="mt-[2px] text-center">
          {text.invitePrefix}{' '}
          <span className="underline">{text.inviteUrl}</span>
        </div>
      </div>
    </div>
  )
}
