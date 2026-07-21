'use client'

import { useState } from 'react'
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

const LINKEDIN_BACKGROUND =
  '/branding/ise-2027-digital-invitation/backgrounds/ISE27 - Digital Invitation - Generic.jpg'

const SAVE_THE_DATE_BACKGROUND =
  '/branding/ise-2027-digital-invitation/backgrounds/ISE27 - Digital Invitation - Save the date.jpg'

export default function LinkedInInvitePreview({
  companyName,
  standNumber,
  invitationCode,
  logoUrl,
  theme,
  mode = 'primary',
}: LinkedInInvitePreviewProps) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const detailLabel = mode === 'secondary' ? 'Invitation ID' : 'Booth number'
  const isSaveTheDateTheme = theme === 'iseBrandingTwo'

  if (isSaveTheDateTheme) {
    return (
      <div className="relative h-[627px] w-[1200px] overflow-hidden bg-[#050b36] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${SAVE_THE_DATE_BACKGROUND}")`,
          }}
        />
        <div className="absolute inset-0 bg-[#050b36]/8" />

        <div className="relative flex h-full flex-col px-[48px] py-[34px]">
          <header className="flex items-start justify-between">
            <div className="flex items-start gap-[42px]">
              <img
                src={ISE_LOGO_WHITE}
                alt="Integrated Systems Europe"
                className="h-[78px] w-auto object-contain"
              />

              <div className="pt-[6px] text-[21px] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
                <div>2 - 5 Feb {EVENT_YEAR}</div>
                <div>Fira de Barcelona, Gran Via</div>
              </div>
            </div>

            <img
              src={ISE_PARTNERS_FOOTER}
              alt="A joint venture partnership of AVIXA and CEDIA"
              className="mt-[8px] h-auto w-[330px] object-contain"
            />
          </header>

          <section className="mt-[74px] flex items-start justify-between gap-10">
            <div className="min-w-0 max-w-[500px]">
              <h2 className="line-clamp-2 overflow-hidden break-words text-[39px] font-semibold uppercase leading-[0.94] tracking-[0em] text-white">
                {companyName || 'BRAND NAME'}
              </h2>

              <p className="mt-[10px] text-[25px] font-medium leading-none tracking-[-0.025em] text-white">
                Has invited you to ISE {EVENT_YEAR}
              </p>
            </div>

            <div className="flex items-start gap-[42px]">
              <div className="flex h-[80px] w-[230px] items-center justify-center rounded-[10px] bg-white px-5">
                {logoUrl && failedLogoUrl !== logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${companyName} logo`}
                    className="max-h-[58px] max-w-[190px] object-contain"
                    onError={() => setFailedLogoUrl(logoUrl)}
                  />
                ) : (
                  <span className="text-[29px] font-medium tracking-[-0.03em] text-[#050b36]">
                    Logo
                  </span>
                )}
              </div>

              <div className="w-[155px] pt-[2px] text-center text-white">
                <p className="text-[25px] font-semibold leading-[1.02] tracking-[-0.035em]">
                  {detailLabel}:
                </p>
                <p className="mt-[6px] break-words text-[21px] font-medium leading-[1.02] tracking-[-0.035em]">
                  {standNumber || '000000'}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-[15px] h-px w-full shrink-0 bg-white/75" />

          <main className="relative flex flex-1 items-end justify-between pb-[20px]">
            <div>
              <h1 className="max-w-[560px] text-[60px] font-semibold uppercase leading-[0.96] tracking-[0em] text-white">
                BARCELONA<br />
                BECKONS...
              </h1>

              <p className="mt-[18px] text-[27px] font-medium uppercase leading-none tracking-[-0.035em] text-white">
                SAVE THE DATE
              </p>
            </div>

            <div className="mb-[30px] mr-[22px] w-[245px] text-center text-white">
              <p className="text-[32px] font-semibold uppercase leading-[1.1] tracking-[-0.035em]">
                SECURE YOUR<br />
                FREE TICKET<br />
                TODAY
              </p>

              <p className="mt-[34px] text-[21px] font-medium leading-[1.1] tracking-[-0.03em]">
                Use the code:<br />
                {invitationCode || 'XXXXXXX'}<br />
                at <span className="underline">iseurope.org/invite</span>
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[627px] w-[1200px] overflow-hidden bg-[#050b36] text-white">
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url("${LINKEDIN_BACKGROUND}")`,
          backgroundSize: '82% auto',
          backgroundPosition: 'center bottom',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_58%,rgba(139,92,246,0.14),transparent_42%)]" />
      <div className="absolute inset-0 bg-[#050b36]/8" />

      <div className="relative flex h-full flex-col px-[48px] py-[34px]">
        <header className="flex items-start justify-between">
          <div className="flex items-start gap-[42px]">
            <img
              src={ISE_LOGO_WHITE}
              alt="Integrated Systems Europe"
              className="h-[78px] w-auto object-contain"
            />

            <div className="pt-[6px] text-[21px] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
              <div>2 - 5 Feb {EVENT_YEAR}</div>
              <div>Fira de Barcelona, Gran Via</div>
            </div>
          </div>

          <img
            src={ISE_PARTNERS_FOOTER}
            alt="A joint venture partnership of AVIXA and CEDIA"
            className="mt-[8px] h-auto w-[330px] object-contain"
          />
        </header>

        <section className="mt-[74px] flex items-start justify-between gap-10">
          <div className="min-w-0 max-w-[500px]">
            <h2 className="line-clamp-2 overflow-hidden break-words text-[39px] font-semibold uppercase leading-[0.94] tracking-[0em] text-white">
              {companyName || 'BRAND NAME'}
            </h2>

            <p className="mt-[10px] text-[25px] font-medium leading-none tracking-[-0.025em] text-white">
              Has invited you to ISE {EVENT_YEAR}
            </p>
          </div>

          <div className="flex items-start gap-[42px]">
            <div className="flex h-[80px] w-[230px] items-center justify-center rounded-[10px] bg-white px-5">
              {logoUrl && failedLogoUrl !== logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  className="max-h-[58px] max-w-[190px] object-contain"
                  onError={() => setFailedLogoUrl(logoUrl)}
                />
              ) : (
                <span className="text-[29px] font-medium tracking-[-0.03em] text-[#050b36]">
                  Logo
                </span>
              )}
            </div>

            <div className="w-[155px] pt-[2px] text-center text-white">
              <p className="text-[25px] font-semibold leading-[1.02] tracking-[-0.035em]">
                {detailLabel}:
              </p>
              <p className="mt-[6px] break-words text-[21px] font-medium leading-[1.02] tracking-[-0.035em]">
                {standNumber || '000000'}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-[15px] h-px w-full shrink-0 bg-white/75" />

        <main className="relative flex flex-1 items-end justify-between pb-[20px]">
          <h1 className="max-w-[620px] text-[76px] font-semibold uppercase leading-[1.02] tracking-[0em] text-white">
            BRING<br />
            YOUR WORLD.<br />
            UNITE WITH US.
          </h1>

          <div className="mb-[30px] mr-[22px] w-[245px] text-center text-white">
            <p className="text-[32px] font-semibold uppercase leading-[1.1] tracking-[-0.035em]">
              SECURE YOUR<br />
              FREE TICKET<br />
              TODAY
            </p>

            <p className="mt-[34px] text-[21px] font-medium leading-[1.1] tracking-[-0.03em]">
              Use the code:<br />
              {invitationCode || 'XXXXXXX'}<br />
              at <span className="underline">iseurope.org/invite</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
