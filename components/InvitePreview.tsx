'use client'

import { useEffect, useMemo, useState } from 'react'
import { makeQrDataUrl } from '@/lib/qr'
import { themes } from '@/lib/themes'
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

function replaceYear(text: string, year: string) {
  return text.replace(/\b20\d{2}\b/g, year)
}

function getFallbackInviteText(language: LanguageKey) {
  switch (language) {
    case 'es':
      return { logoUnavailable: 'Logotipo no disponible', companyName: 'Nombre de la empresa', booth: 'Stand', booths: 'Stands', qrUnavailable: 'QR no disponible', scanToRegister: 'Escanee para registrarse', registrationUrlUnavailable: 'URL de registro no disponible', freePass: 'Pase gratuito para visitantes' }
    case 'de':
      return { logoUnavailable: 'Logo nicht verfügbar', companyName: 'Firmenname', booth: 'Stand', booths: 'Stände', qrUnavailable: 'QR nicht verfügbar', scanToRegister: 'Zum Registrieren scannen', registrationUrlUnavailable: 'Registrierungs-URL nicht verfügbar', freePass: 'Kostenloser Besucherpass' }
    case 'fr':
      return { logoUnavailable: 'Logo indisponible', companyName: 'Nom de l’entreprise', booth: 'Stand', booths: 'Stands', qrUnavailable: 'QR indisponible', scanToRegister: 'Scanner pour s’inscrire', registrationUrlUnavailable: 'URL d’inscription indisponible', freePass: 'Pass visiteur gratuit' }
    case 'it':
      return { logoUnavailable: 'Logo non disponibile', companyName: 'Nome azienda', booth: 'Stand', booths: 'Stand', qrUnavailable: 'QR non disponibile', scanToRegister: 'Scansiona per registrarti', registrationUrlUnavailable: 'URL di registrazione non disponibile', freePass: 'Pass visitatore gratuito' }
    case 'pt':
      return { logoUnavailable: 'Logótipo indisponível', companyName: 'Nome da empresa', booth: 'Stand', booths: 'Stands', qrUnavailable: 'QR indisponível', scanToRegister: 'Digitalize para se registar', registrationUrlUnavailable: 'URL de registo indisponível', freePass: 'Passe gratuito de visitante' }
    case 'nl':
      return { logoUnavailable: 'Logo niet beschikbaar', companyName: 'Bedrijfsnaam', booth: 'Stand', booths: 'Stands', qrUnavailable: 'QR niet beschikbaar', scanToRegister: 'Scan om te registreren', registrationUrlUnavailable: 'Registratie-URL niet beschikbaar', freePass: 'Gratis bezoekerspas' }
    case 'zh-CN':
      return { logoUnavailable: '暂无标志', companyName: '公司名称', booth: '展位', booths: '展位', qrUnavailable: '二维码不可用', scanToRegister: '扫码注册', registrationUrlUnavailable: '注册链接不可用', freePass: '免费观众通行证' }
    default:
      return { logoUnavailable: 'Logo unavailable', companyName: 'Company name', booth: 'Stand', booths: 'Stands', qrUnavailable: 'QR unavailable', scanToRegister: 'Scan to register', registrationUrlUnavailable: 'Registration URL unavailable', freePass: 'Free visitor pass' }
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
  const [logoError, setLogoError] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const text = translations[language].invite
  const fallbackText = getFallbackInviteText(language)
  const selectedTheme = themes[theme]

  const headline = useMemo(() => replaceYear(text.headline, EVENT_YEAR), [text.headline])
  const eventLabel = `ISE ${EVENT_YEAR}`

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

  useEffect(() => {
    setLogoError(false)
  }, [logoUrl])

  return (
    <div className="w-[1200px] overflow-hidden rounded-[46px] border border-white/15 bg-[#020617] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
      <div className="grid min-h-[628px] grid-cols-[50%_50%]">
        <section
          className="relative overflow-hidden p-14 text-white"
          style={{
            backgroundImage: `url(${selectedTheme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.65),transparent_34%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/40 to-black/90" />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/90 backdrop-blur-xl">
                {eventLabel}
              </div>

              <h2 className="mt-10 max-w-[500px] text-[66px] font-semibold leading-[0.95] tracking-[-0.06em]">
                {headline}
              </h2>

              <p className="mt-7 max-w-[420px] text-[27px] font-medium leading-tight text-white/85">
                {text.subheadline}
              </p>
            </div>

            <div className="max-w-[500px] rounded-[32px] border border-white/15 bg-white/[0.11] p-7 shadow-2xl backdrop-blur-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100/80">
                {fallbackText.freePass}
              </div>
              <div className="mt-3 text-3xl font-semibold leading-tight">
                {text.freeAccess}
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex flex-col justify-between bg-white p-14 text-zinc-950">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />

          <div className="relative">
            <div className="flex h-28 items-center">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  className="max-h-24 max-w-[330px] object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-24 w-[330px] items-center justify-center rounded-[28px] border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-400">
                  {fallbackText.logoUnavailable}
                </div>
              )}
            </div>

            <h3 className="mt-10 max-w-[470px] text-[52px] font-semibold leading-[1.01] tracking-[-0.05em] text-zinc-950">
              {companyName || fallbackText.companyName}
            </h3>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-[30px] border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                  {hasMultipleBooths ? fallbackText.booths : fallbackText.booth}
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
                  {boothDisplay || '—'}
                </div>
              </div>

              <div className="rounded-[30px] border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                  {text.codeLabel.replace(':', '').replace('：', '')}
                </div>
                <div className="mt-3 break-all text-2xl font-semibold tracking-tight text-zinc-950">
                  {invitationCode || '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 rounded-[34px] border border-zinc-200 bg-zinc-50 p-6">
            <div className="flex items-center gap-6">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Registration QR code"
                  className="h-40 w-40 rounded-[26px] border border-zinc-200 bg-white object-contain p-3 shadow-sm"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-[26px] border border-zinc-200 bg-white text-sm font-semibold text-zinc-400">
                  {fallbackText.qrUnavailable}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-2xl font-semibold tracking-tight text-zinc-950">
                  {fallbackText.scanToRegister}
                </p>
                <p className="mt-3 break-all text-sm leading-6 text-zinc-500">
                  {registrationUrl || fallbackText.registrationUrlUnavailable}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
