'use client'

import { useEffect, useRef, useState } from 'react'
import EmailBannerPreview from '@/components/EmailBannerPreview'
import InvitePreview from '@/components/InvitePreview'
import LinkedInInvitePreview from '@/components/LinkedInInvitePreview'
import SquareInvitePreview from '@/components/SquareInvitePreview'
import { useSiteLanguage } from '@/components/LanguageSwitcher'
import {
 exportPdf,
 exportPng,
 exportZipPack,
 makeExportBaseName,
 type ExportFormatKey,
} from '@/lib/export'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type Props = {
 initialToken?: string
}

const orderedThemeKeys: ThemeKey[] = [
 'iseBrandingOne',
 'iseBrandingTwo',
 'audio',
 'residential',
 'lighting',
 'unifiedCommunications',
 'educationTechnology',
 'digitalSignage',
 'smartBuilding',
 'contentProduction',
]

type DisplayMode = 'dark' | 'light'

const CARD_LANGUAGE_STORAGE_KEY = 'ise-card-language'
const DISPLAY_MODE_STORAGE_KEY = 'ise-generator-display-mode'

export default function GeneratorPageClient({ initialToken }: Props) {
 const exportPreviewRef = useRef<HTMLDivElement | null>(null)
 const emailBannerExportRef = useRef<HTMLDivElement | null>(null)
 const squareExportRef = useRef<HTMLDivElement | null>(null)
 const linkedinExportRef = useRef<HTMLDivElement | null>(null)

 const [generatorLanguage] = useSiteLanguage()
 const text = translations[generatorLanguage].ui

 const [cardLanguage, setCardLanguage] = useState<LanguageKey>(() => {
  if (typeof window === 'undefined') return 'en'

  const saved = window.localStorage.getItem(CARD_LANGUAGE_STORAGE_KEY)

  if (saved && saved in translations) {
   return saved as LanguageKey
  }

  return 'en'
 })

 const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
  if (typeof window === 'undefined') return 'dark'

  const saved = window.localStorage.getItem(DISPLAY_MODE_STORAGE_KEY)

  if (saved === 'light' || saved === 'dark') {
   return saved
  }

  return 'dark'
 })

 const [isExporting, setIsExporting] = useState(false)
 const [exportError, setExportError] = useState<string | null>(null)
 const [showDownloadPanel, setShowDownloadPanel] = useState(false)
 const [sessionMessage, setSessionMessage] = useState<string | null>(null)

 const [exhibitorId, setExhibitorId] = useState('')
 const [companyName, setCompanyName] = useState('Samsung')
 const [standNumber, setStandNumber] = useState('5C300')
 const [invitationCode, setInvitationCode] = useState('ISE2027')
 const [registrationUrl, setRegistrationUrl] = useState('https://www.iseurope.org/welcome/registration')
 const [logoUrl, setLogoUrl] = useState('')
 const [logoMessage, setLogoMessage] = useState<string | null>(null)
 const [theme, setTheme] = useState<ThemeKey>('audio')

 const isLightMode = displayMode === 'light'

 const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '')

 const qrTrackingUrl = exhibitorId
  ? `${appBaseUrl}/r/${encodeURIComponent(exhibitorId)}`
  : registrationUrl

 useEffect(() => {
  window.localStorage.setItem(CARD_LANGUAGE_STORAGE_KEY, cardLanguage)
 }, [cardLanguage])

 useEffect(() => {
  window.localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, 'dark')
 }, [])

 function handleLogoUpload(file: File | null) {
  setLogoMessage(null)

  if (!file) return

  const maxSizeMb = 3
  const maxSizeBytes = maxSizeMb * 1024 * 1024

  if (file.size > maxSizeBytes) {
   setLogoMessage(`Logo is too large. Maximum size is ${maxSizeMb}MB.`)
   return
  }

  if (!file.type.startsWith('image/')) {
   setLogoMessage('Please upload a valid image file.')
   return
  }

  const reader = new FileReader()

  reader.onload = () => {
   const result = typeof reader.result === 'string' ? reader.result : ''
   const image = new Image()

   image.onload = () => {
    if (image.width < 300 || image.height < 120) {
     setLogoMessage(
      'Logo uploaded, but recommended minimum size is 300 × 120px for best export quality.'
     )
    }

    setLogoUrl(result)
   }

   image.onerror = () => {
    setLogoMessage('Could not read this logo image.')
   }

   image.src = result
  }

  reader.readAsDataURL(file)
 }

 function removeLogo() {
  setLogoUrl('')
  setLogoMessage(null)
 }

 useEffect(() => {
  async function loadSession() {
   if (!initialToken) return

   try {
    setSessionMessage('Loading verified exhibitor details...')

    const response = await fetch('/api/session', {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     body: JSON.stringify({ token: initialToken }),
    })

    const data = await response.json()

    if (!response.ok || !data?.ok || !data?.exhibitor) {
     setSessionMessage(data?.error || 'Could not verify exhibitor session.')
     return
    }

    const exhibitor = data.exhibitor

    setExhibitorId(exhibitor.id || exhibitor.exhibitorId || '')
    setCompanyName(exhibitor.companyName || exhibitor.name || companyName)
    setStandNumber(exhibitor.standNumber || exhibitor.stand || standNumber)
    setInvitationCode(exhibitor.invitationCode || exhibitor.code || invitationCode)
    setRegistrationUrl(exhibitor.registrationUrl || registrationUrl)
    setLogoUrl(exhibitor.logoUrl || '')

    if (exhibitor.theme) {
     setTheme(exhibitor.theme)
    }

    if (exhibitor.language && exhibitor.language in translations) {
     setCardLanguage(exhibitor.language as LanguageKey)
    }

    setSessionMessage('Verified exhibitor details loaded.')
   } catch {
    setSessionMessage('Could not load exhibitor details.')
   }
  }

  loadSession()
 }, [
  initialToken,
  companyName,
  standNumber,
  invitationCode,
  registrationUrl,
 ])

 async function runExport(type: 'pdf' | 'zip' | ExportFormatKey) {
  const exportNode = type === 'email' ? emailBannerExportRef.current : type === 'square' ? exportPreviewRef.current : type === 'linkedin' ? linkedinExportRef.current : exportPreviewRef.current

  if (!exportNode) {
   setExportError('Preview element not found.')
   return
  }

  try {
   setIsExporting(true)
   setExportError(null)

   const baseName = makeExportBaseName(companyName, standNumber)

   if (type === 'pdf') {
    await exportPdf(exportNode, baseName)
    return
   }

   if (type === 'zip') {
    await exportZipPack(exportPreviewRef.current || exportNode, baseName, emailBannerExportRef.current || undefined, exportPreviewRef.current || undefined, linkedinExportRef.current || undefined)
    return
   }

   await exportPng(exportNode, type, baseName)
  } catch (error) {
   setExportError(error instanceof Error ? error.message : 'Export failed.')
  } finally {
   setIsExporting(false)
  }
 }

 const pageClassName = isLightMode
  ? 'h-[calc(100vh-128px)] overflow-hidden bg-transparent text-slate-950'
  : 'h-[calc(100vh-128px)] overflow-hidden bg-transparent text-white'

 const sidebarClassName = isLightMode
  ? 'relative flex h-full min-h-0 flex-col border-r border-white/60 bg-white/72 shadow-[18px_0_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl '
  : 'relative flex h-full min-h-0 flex-col border-r border-white/10 bg-white/[0.075] shadow-[22px_0_70px_rgba(0,0,0,0.36)] backdrop-blur-2xl '

 const previewClassName = isLightMode
  ? 'relative hidden h-full min-h-0 items-center justify-center overflow-hidden bg-white/12 -[2px] lg:flex'
  : 'relative hidden h-full min-h-0 items-center justify-center overflow-hidden bg-black/18 -[2px] lg:flex'

 const inputClassName = isLightMode
  ? 'w-full rounded-[18px] border border-slate-200/80 bg-white/90 px-4 py-4 text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
  : 'w-full rounded-[18px] border border-white/10 bg-white/[0.075] px-4 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10'

 const labelClassName = isLightMode
  ? 'mb-2 block text-sm font-medium text-slate-700'
  : 'mb-2 block text-sm font-medium text-white/70'

 const helperClassName = isLightMode
  ? 'text-sm text-slate-500'
  : 'text-sm text-white/52'

 const panelClassName = isLightMode
  ? 'rounded-[22px] border border-white/70 bg-white/78 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl '
  : 'rounded-[22px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl '

 const secondaryButtonClassName = isLightMode
  ? 'rounded-2xl border border-green-900/20 bg-[#2f6f3e] py-3 font-semibold text-white transition hover:bg-[#285f35] disabled:opacity-50'
  : 'rounded-2xl border border-green-300/10 bg-[#2f6f3e] py-3 font-semibold text-white transition hover:bg-[#285f35] disabled:opacity-50'

 return (
  <main className={pageClassName}>
   <div className="grid h-full lg:grid-cols-[500px_1fr]">
    <aside className={sidebarClassName}>
     <div className={isLightMode ? 'shrink-0 border-b border-white/70 px-7 py-6' : 'shrink-0 border-b border-white/10 px-7 py-6'}>
      <p className={isLightMode ? 'text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500' : 'text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38'}>
       Generator controls
      </p>
      <p className={`mt-2 leading-6 ${helperClassName}`}>
       {text.generatorInputsDescription}
      </p>
     </div>

     <div className="flex-1 overflow-y-auto px-7 py-6">
      <div className="space-y-5">
       <section className={isLightMode ? 'rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl'}>
        <h2 className="text-xl font-semibold">{text.generatorInputsTitle}</h2>
        <p className={`mt-1 ${helperClassName}`}>
         {text.generatorEditableDescription || 'Manage the editable details that appear on the invitation card.'}
        </p>

        {sessionMessage ? (
         <div
          className={
           isLightMode
            ? 'mt-4 rounded-2xl border border-blue-200 bg-white/70 px-4 py-3 text-xs text-blue-700 '
            : 'mt-4 rounded-2xl border border-blue-400/20 bg-black/28 px-4 py-3 text-xs text-blue-100 '
          }
         >
          {sessionMessage}
         </div>
        ) : null}

        <div className="mt-4 space-y-4">
         <label className="block">
          <span className={labelClassName}>{text.generatorCompanyName}</span>
          <input
           value={companyName}
           onChange={(event) => setCompanyName(event.target.value)}
           className={inputClassName}
          />
         </label>

         <div className={panelClassName}>
          <div className="flex items-start justify-between gap-4">
           <div>
            <p className="text-sm font-semibold">{text.generatorVerifiedDetailsTitle || 'Verified invitation details'}</p>
            <p className={`mt-1 text-xs ${helperClassName}`}>
             {text.generatorVerifiedDetailsDescription || 'These values are pulled from the exhibitor profile and cannot be edited here.'}
            </p>
           </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
           <div className={isLightMode ? 'rounded-2xl border border-slate-200 bg-white/70 p-4' : 'rounded-2xl border border-white/10 bg-white/[0.04] p-4'}>
            <p className={isLightMode ? 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500' : 'text-xs font-semibold uppercase tracking-[0.18em] text-white/40'}>
             {text.generatorStandNumber}
            </p>
            <p className={isLightMode ? 'mt-2 break-words text-base font-semibold text-slate-950' : 'mt-2 break-words text-base font-semibold text-white'}>
             {standNumber || '—'}
            </p>
           </div>

           <div className={isLightMode ? 'rounded-2xl border border-slate-200 bg-white/70 p-4' : 'rounded-2xl border border-white/10 bg-white/[0.04] p-4'}>
            <p className={isLightMode ? 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500' : 'text-xs font-semibold uppercase tracking-[0.18em] text-white/40'}>
             {text.generatorInvitationCode}
            </p>
            <p className={isLightMode ? 'mt-2 break-words text-base font-semibold text-slate-950' : 'mt-2 break-words text-base font-semibold text-white'}>
             {invitationCode || '—'}
            </p>
           </div>
          </div>
         </div>

         <label className="block">
          <span className={labelClassName}>{text.generatorCardLanguage || 'Invitation card language'}</span>
          <select
           value={cardLanguage}
           onChange={(event) => setCardLanguage(event.target.value as LanguageKey)}
           className={inputClassName}
          >
           {Object.entries(translations).map(([key, bundle]) => (
            <option key={key} value={key} className="text-black">
             {bundle.ui.languageName}
            </option>
           ))}
          </select>

          <p className={`mt-2 text-xs ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
           {text.generatorCardLanguageHelp || 'This changes the invitation card and exports only.'}
          </p>
         </label>

         <div className={panelClassName}>
          <div className="mb-3 flex items-center justify-between gap-3">
           <div>
            <div className={isLightMode ? 'text-sm font-medium text-slate-700' : 'text-sm font-medium text-white/70'}>
             {text.generatorLogoUpload}
            </div>
            <div className={isLightMode ? 'mt-1 text-xs text-slate-500' : 'mt-1 text-xs text-white/35'}>
             {text.generatorLogoHelp || 'PNG/JPG/WebP. Max 3MB. Recommended 300 × 120px minimum.'}
            </div>
           </div>

           {logoUrl ? (
            <button
             type="button"
             onClick={removeLogo}
             className={
              isLightMode
               ? 'rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100'
               : 'rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10'
             }
            >
             {text.generatorRemoveLogo || 'Remove'}
            </button>
           ) : null}
          </div>

          <label
           className={
            isLightMode
             ? 'flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500 transition hover:border-blue-400 hover:bg-blue-50'
             : 'flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-white/55 transition hover:border-blue-400/40 hover:bg-blue-500/10'
           }
          >
           {text.generatorLogoUpload}
           <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
            className="hidden"
           />
          </label>

          {logoMessage ? (
           <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-700">
            {logoMessage}
           </div>
          ) : null}
         </div>
        </div>
       </section>

       <section className={isLightMode ? 'rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl'}>
        <h2 className="text-xl font-semibold">{text.generatorChooseTheme || 'Choose your theme'}</h2>
        <div className="mt-5 grid gap-3">
         {orderedThemeKeys.map((key) => {
          const item = themes[key]
          const active = theme === key

          return (
           <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={`relative overflow-hidden rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-400/70 ${
             active
              ? 'border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.30),0_16px_38px_rgba(37,99,235,0.18)]'
              : isLightMode
               ? 'border-white/80 shadow-[0_10px_28px_rgba(15,23,42,0.08)]'
               : 'border-white/10 shadow-[0_14px_32px_rgba(0,0,0,0.22)]'
            }`}
           >
            <div
             className="absolute inset-0 bg-cover bg-center opacity-25"
             style={{ backgroundImage: `url(${item.backgroundImage})` }}
            />
            <div className={isLightMode ? 'absolute inset-0 bg-white/74' : 'absolute inset-0 bg-black/62'} />
            <div className="relative">
             <div className="text-xl font-semibold">{item.label}</div>

            </div>
           </button>
          )
         })}
        </div>
       </section>
      </div>
     </div>

     <div className={isLightMode ? 'shrink-0 border-t border-white/70 bg-white/76 p-4 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'shrink-0 border-t border-white/10 bg-white/[0.07] p-4 shadow-[0_-18px_48px_rgba(0,0,0,0.30)] backdrop-blur-xl'}>
      <button
       type="button"
       disabled={isExporting}
       onClick={() => setShowDownloadPanel(true)}
       className="w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:opacity-50"
      >
       {text.generatorDownloadFormats || 'Download formats'}
      </button>

      {exportError ? (
       <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {exportError}
       </div>
      ) : null}
     </div>
    </aside>

    <section className={previewClassName}>
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />

     <div className="relative scale-[0.54] xl:scale-[0.64] 2xl:scale-[0.72]">
      <InvitePreview
       companyName={companyName}
       standNumber={standNumber}
       invitationCode={invitationCode}
       logoUrl={logoUrl}
       registrationUrl={qrTrackingUrl}
       theme={theme}
       language={cardLanguage}
      />
     </div>
    </section>
   </div>

   <div className="pointer-events-none absolute -left-[99999px] top-0">
    <div ref={exportPreviewRef}>
     <InvitePreview
      companyName={companyName}
      standNumber={standNumber}
      invitationCode={invitationCode}
      logoUrl={logoUrl}
      registrationUrl={qrTrackingUrl}
      theme={theme}
      language={cardLanguage}
     />
    </div>

    <div ref={emailBannerExportRef}>
     <EmailBannerPreview
      companyName={companyName}
      standNumber={standNumber}
      invitationCode={invitationCode}
      logoUrl={logoUrl}
      registrationUrl={qrTrackingUrl}
      theme={theme}
      language={cardLanguage}
     />
    </div>

    <div ref={squareExportRef}>
     <SquareInvitePreview
      companyName={companyName}
      standNumber={standNumber}
      invitationCode={invitationCode}
      logoUrl={logoUrl}
      registrationUrl={qrTrackingUrl}
      theme={theme}
      language={cardLanguage}
     />
    </div>

    <div ref={linkedinExportRef}>
     <LinkedInInvitePreview
      companyName={companyName}
      standNumber={standNumber}
      invitationCode={invitationCode}
      logoUrl={logoUrl}
      registrationUrl={qrTrackingUrl}
      theme={theme}
      language={cardLanguage}
     />
    </div>
   </div>

   {showDownloadPanel ? (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
     <button
      type="button"
      aria-label="Close download panel"
      onClick={() => setShowDownloadPanel(false)}
      className="absolute inset-0 bg-black/62 backdrop-blur-md"
     />

     <div className={isLightMode ? 'relative w-full max-w-[520px] rounded-[32px] border border-white/80 bg-white/92 p-6 text-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-2xl' : 'relative w-full max-w-[520px] rounded-[32px] border border-white/12 bg-[#10162b]/94 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl'}>
      <div className="flex items-start justify-between gap-4">
       <div>
        <p className={isLightMode ? 'text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500' : 'text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45'}>
         {text.generatorExportAssets || 'Export assets'}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
         {text.generatorDownloadChoice || 'Download the format of your choice'}
        </h2>
        <p className={isLightMode ? 'mt-2 text-sm leading-6 text-slate-500' : 'mt-2 text-sm leading-6 text-white/50'}>
         {text.generatorDownloadDescription || 'Choose a single format or download the complete ZIP pack.'}
        </p>
       </div>

       <button
        type="button"
        onClick={() => setShowDownloadPanel(false)}
        className={isLightMode ? 'rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200' : 'rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/15 hover:text-white'}
       >
        {text.generatorClose || 'Close'}
       </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
       <button
        disabled={isExporting}
        onClick={() => runExport('square')}
        className="rounded-2xl border border-green-300/10 bg-[#2f6f3e] py-4 font-semibold text-white transition hover:bg-[#285f35] disabled:opacity-50"
       >
        {text.generatorPngSquare}
       </button>

       <button disabled={isExporting} onClick={() => runExport('pdf')} className={secondaryButtonClassName}>
        {text.generatorPdf}
       </button>

       <button disabled={isExporting} onClick={() => runExport('linkedin')} className={secondaryButtonClassName}>
        LinkedIn
       </button>

       <button disabled={isExporting} onClick={() => runExport('email')} className={secondaryButtonClassName}>
        Email Banner
       </button>

       <button
        disabled={isExporting}
        onClick={() => runExport('zip')}
        className="col-span-2 rounded-2xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
       >
        ZIP Pack (all formats)
       </button>
      </div>
     </div>
    </div>
   ) : null}

  </main>
 )
}
