'use client'

import { useState } from 'react'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type EmailBannerPreviewProps = {
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
const PARTNERS_FOOTER =
  '/branding/toolkit/ise-partners-footer-transparent.png?v=20270623'

const EMAIL_BACKGROUND =
  '/branding/ise-2027-digital-invitation/backgrounds/ISE27 - Digital Invitation - Generic.jpg'

const SAVE_THE_DATE_BACKGROUND =
  '/branding/ise-2027-digital-invitation/backgrounds/ISE27 - Digital Invitation - Save the date.jpg'

function getEmailBannerText(language: LanguageKey) {
  switch (language) {
    case 'es':
      return {
        join: `ÚNASE A NOSOTROS EN ISE ${EVENT_YEAR}`,
        headline: 'CUANDO LOS MUNDOS SE UNEN',
        ticket: 'ASEGURE SU ENTRADA GRATUITA HOY',
        useCode: 'Use el código:',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Número de stand:',
      }
    case 'de':
      return {
        join: `BESUCHEN SIE UNS AUF DER ISE ${EVENT_YEAR}`,
        headline: 'WENN WELTEN SICH VEREINEN',
        ticket: 'SICHERN SIE SICH HEUTE IHR KOSTENLOSES TICKET',
        useCode: 'Code verwenden:',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Standnummer:',
      }
    case 'fr':
      return {
        join: `REJOIGNEZ-NOUS À ISE ${EVENT_YEAR}`,
        headline: 'QUAND LES MONDES S’UNISSENT',
        ticket: 'RÉSERVEZ VOTRE BILLET GRATUIT AUJOURD’HUI',
        useCode: 'Utilisez le code :',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Numéro de stand :',
      }
    case 'it':
      return {
        join: `UNISCITI A NOI A ISE ${EVENT_YEAR}`,
        headline: 'QUANDO I MONDI SI UNISCONO',
        ticket: 'ASSICURA OGGI IL TUO BIGLIETTO GRATUITO',
        useCode: 'Usa il codice:',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Numero stand:',
      }
    case 'ca':
      return {
        join: `UNEIX-TE A NOSALTRES A ISE ${EVENT_YEAR}`,
        headline: 'QUAN ELS MONS S’UNEIXEN',
        ticket: 'ASSEGURA LA TEVA ENTRADA GRATUÏTA AVUI',
        useCode: 'Utilitza el codi:',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Número d’estand:',
      }
    case 'zh-CN':
      return {
        join: `欢迎参加 ISE ${EVENT_YEAR}`,
        headline: '世界在此汇聚',
        ticket: '立即获取免费门票',
        useCode: '使用邀请码：',
        inviteUrl: 'iseurope.org/invite',
        booth: '展位号：',
      }
    default:
      return {
        join: `JOIN US AT ISE ${EVENT_YEAR}`,
        headline: 'WHEN WORLDS UNITE',
        ticket: 'SECURE YOUR FREE TICKET TODAY',
        useCode: 'Use the code:',
        inviteUrl: 'iseurope.org/invite',
        booth: 'Booth number:',
      }
  }
}

export default function EmailBannerPreview({
  standNumber,
  invitationCode,
  logoUrl,
  theme,
  language,
  mode = 'primary',
}: EmailBannerPreviewProps) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const text = getEmailBannerText(language)
  const boothLabel = mode === 'secondary' ? 'Invitation ID:' : text.booth
  const boothDisplay = standNumber?.trim() || '000000'
  const codeDisplay = invitationCode?.trim() || 'ISE2027'
  const isSaveTheDateTheme = theme === 'iseBrandingTwo'

  if (isSaveTheDateTheme) {
    return (
      <div className="relative h-[300px] w-[1200px] overflow-hidden bg-[#020b56] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${SAVE_THE_DATE_BACKGROUND}")`,
          }}
        />

        <div className="relative h-full px-[42px] pt-[26px] pb-[18px]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-[34px]">
              <img
                src={ISE_LOGO_WHITE}
                alt="Integrated Systems Europe"
                className="h-[60px] w-auto object-contain"
              />

              <div className="pt-[2px] text-[18px] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                <div>2 - 5 Feb {EVENT_YEAR}</div>
                <div>Fira de Barcelona, Gran Via</div>
              </div>
            </div>

            <div className="flex items-start gap-[22px]">
              <div className="flex h-[64px] w-[168px] items-center justify-center rounded-[10px] bg-white px-4">
                {logoUrl && failedLogoUrl !== logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="max-h-[44px] max-w-[138px] object-contain"
                    onError={() => setFailedLogoUrl(logoUrl)}
                  />
                ) : (
                  <span className="text-[22px] font-medium tracking-[-0.03em] text-[#111a4a]">
                    Logo
                  </span>
                )}
              </div>

              <div className="w-[104px] pt-[2px] text-center text-white">
                <div className="text-[17px] font-semibold leading-[1.02] tracking-[0em]">
                  {boothLabel}
                </div>
                <div className="mt-[2px] text-[15px] font-medium leading-[1.02] tracking-[-0.035em]">
                  {boothDisplay}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[44px] flex items-start justify-between">
            <div className="min-w-0">
              <div className="text-[34px] font-medium uppercase leading-none tracking-[0em] text-white">
                ISE {EVENT_YEAR}
              </div>

              <div className="mt-[18px] max-w-[620px] text-[74px] font-medium uppercase leading-[0.92] tracking-[-0.06em] text-white">
                SAVE THE DATE
              </div>
            </div>

            <div className="mr-[18px] mt-[2px] w-[220px] text-center text-white">
              <div className="text-[24px] font-medium uppercase leading-[1.04] tracking-[0em]">
                {text.ticket}
              </div>

              <div className="mt-[22px] text-[16px] font-medium leading-[1.1] tracking-[-0.03em]">
                <div>{text.useCode}</div>
                <div>{codeDisplay}</div>
                <div className="mt-[2px] text-center underline">at {text.inviteUrl}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] w-[1200px] overflow-hidden bg-[#020b56] text-white">
      <div
        className="absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={EMAIL_BACKGROUND}
          alt=""
          className="absolute left-0 top-0 h-auto w-full"
        />
      </div>

      <div className="relative h-full px-[42px] pt-[26px] pb-[18px]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-[34px]">
            <img
              src={ISE_LOGO_WHITE}
              alt="Integrated Systems Europe"
              className="h-[60px] w-auto object-contain"
            />

            <div className="pt-[2px] text-[18px] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              <div>2 - 5 Feb {EVENT_YEAR}</div>
              <div>Fira de Barcelona, Gran Via</div>
            </div>
          </div>

          <div className="flex items-start gap-[26px]">
            <img
              src={PARTNERS_FOOTER}
              alt="A joint venture partnership of AVIXA and CEDIA"
              className="mt-[4px] h-auto w-[195px] object-contain"
            />

            <div className="flex items-start gap-[22px]">
              <div className="flex h-[64px] w-[168px] items-center justify-center rounded-[10px] bg-white px-4">
                {logoUrl && failedLogoUrl !== logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="max-h-[44px] max-w-[138px] object-contain"
                    onError={() => setFailedLogoUrl(logoUrl)}
                  />
                ) : (
                  <span className="text-[22px] font-medium tracking-[-0.03em] text-[#111a4a]">
                    Logo
                  </span>
                )}
              </div>

              <div className="w-[104px] pt-[2px] text-center text-white">
                <div className="text-[17px] font-semibold leading-[1.02] tracking-[0em]">
                  {boothLabel}
                </div>
                <div className="mt-[2px] text-[15px] font-medium leading-[1.02] tracking-[-0.035em]">
                  {boothDisplay}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[42px] flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-[24px] font-medium uppercase leading-none tracking-[-0.035em] text-white">
              {text.join}
            </div>

            <div className="mt-[12px] max-w-[620px] text-[58px] font-medium uppercase leading-[0.92] tracking-[-0.06em] text-white">
              {text.headline}
            </div>
          </div>

          <div className="mr-[18px] mt-[8px] w-[220px] text-center text-white">
            <div className="text-[24px] font-medium uppercase leading-[1.04] tracking-[0em]">
              {text.ticket}
            </div>

            <div className="mt-[22px] text-[16px] font-medium leading-[1.1] tracking-[-0.03em]">
              <div>{text.useCode}</div>
              <div>{codeDisplay}</div>
              <div className="mt-[2px] text-center underline">at {text.inviteUrl}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
