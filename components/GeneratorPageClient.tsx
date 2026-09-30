'use client'

import { useEffect, useRef, useState } from 'react'
import EmailBannerPreview from '@/components/EmailBannerPreview'
import InvitePreview from '@/components/InvitePreview'
import LinkedInInvitePreview from '@/components/LinkedInInvitePreview'
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
import type { EditableInviteData, LanguageKey, ThemeKey } from '@/lib/types'

type Props = {
 initialToken?: string
 initialData?: Partial<EditableInviteData> & {
  exhibitorId?: string
  sessionMessage?: string
 }
 enableQrTracking?: boolean
 mode?: 'primary' | 'secondary'
}

const orderedThemeKeys: ThemeKey[] = [
  'iseBrandingTwo',
  'iseBrandingOne',
  'audio',
  'contentProduction',
  'digitalSignage',
  'educationTechnology',
  'lighting',
  'unifiedCommunications',
  'residential',
  'smartBuilding',
]

type DisplayMode = 'dark' | 'light'

const CARD_LANGUAGE_STORAGE_KEY = 'ise-card-language'
const DISPLAY_MODE_STORAGE_KEY = 'ise-generator-display-mode'

export default function GeneratorPageClient({
 initialToken,
 initialData,
 enableQrTracking = true,
 mode = 'primary',
}: Props) {
 const exportPreviewRef = useRef<HTMLDivElement | null>(null)
 const emailBannerExportRef = useRef<HTMLDivElement | null>(null)
 const linkedinExportRef = useRef<HTMLDivElement | null>(null)
  const previewAreaRef = useRef<HTMLElement | null>(null)
  const [previewScale, setPreviewScale] = useState(0.46)

  useEffect(() => {
    const calculatePreviewScale = () => {
      const area = previewAreaRef.current

      if (!area) return

      const safeWidth = Math.max(area.clientWidth - 72, 320)
      const safeHeight = Math.max(area.clientHeight - 72, 320)

      const widthScale = safeWidth / 980
      const heightScale = safeHeight / 1210
      const nextScale = Math.max(0.36, Math.min(0.58, widthScale, heightScale))

      setPreviewScale(Number(nextScale.toFixed(3)))
    }

    calculatePreviewScale()

    const area = previewAreaRef.current
    const observer =
      typeof ResizeObserver !== 'undefined' && area
        ? new ResizeObserver(calculatePreviewScale)
        : null

    if (observer && area) {
      observer.observe(area)
    }

    window.addEventListener('resize', calculatePreviewScale)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', calculatePreviewScale)
    }
  }, [])


 const [generatorLanguage] = useSiteLanguage()
 const text = translations[generatorLanguage].ui

 const [cardLanguage, setCardLanguage] = useState<LanguageKey>(() => {
  if (initialData?.language && initialData.language in translations) return initialData.language
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
 const [sessionMessage, setSessionMessage] = useState<string | null>(initialData?.sessionMessage || null)
 const [isSessionLoading, setIsSessionLoading] = useState(Boolean(initialToken))

 const [exhibitorId, setExhibitorId] = useState(initialData?.exhibitorId || '')
 const [companyName, setCompanyName] = useState(initialData?.companyName || '')
 const [standNumber, setStandNumber] = useState(initialData?.standNumber || '')
 const [invitationCode, setInvitationCode] = useState(initialData?.invitationCode || '')
 const [registrationUrl, setRegistrationUrl] = useState(initialData?.registrationUrl || '')
 const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '')
 const [logoMessage, setLogoMessage] = useState<string | null>(null)
 const [theme, setTheme] = useState<ThemeKey>(initialData?.theme || 'audio')

 const isLightMode = displayMode === 'light'

 const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '')
 const qrTrackingUrl = enableQrTracking && exhibitorId
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
   if (!initialToken) {
    setIsSessionLoading(false)
    return
   }

   try {
    setIsSessionLoading(true)
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
    setCompanyName(exhibitor.companyName || exhibitor.name || '')
    setStandNumber(exhibitor.standNumber || exhibitor.stand || '')
    setInvitationCode(exhibitor.invitationCode || exhibitor.code || '')
    setRegistrationUrl(exhibitor.registrationUrl || '')
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
   } finally {
    setIsSessionLoading(false)
   }
  }

  loadSession()
 }, [initialToken])

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
  ? 'h-[calc(100vh-64px)] overflow-hidden bg-transparent text-slate-950'
  : 'h-[calc(100vh-64px)] overflow-hidden bg-transparent text-white'

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
     <div className="flex-1 overflow-y-auto px-7 py-6">
      <div className="space-y-5">
       <section className={isLightMode ? 'rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl'}>
        <h2 className="text-xl font-semibold">{text.generatorInputsTitle}</h2>
        <p className={`mt-1 whitespace-nowrap text-[11px] ${helperClassName}`}>
         {text.generatorEditableDescription || 'Manage the details that appear on the invitation card.'}
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

        <div className="mt-3 space-y-3">
         <div className={panelClassName}>
          <label
           className={
            isLightMode
             ? 'block rounded-2xl border border-slate-200 bg-white/70 p-4'
             : 'block rounded-2xl border border-white/10 bg-white/[0.04] p-4'
           }
          >
           <span
            className={
             isLightMode
              ? 'block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'
              : 'block text-xs font-semibold uppercase tracking-[0.18em] text-white/40'
            }
           >
            {text.generatorCompanyName}
           </span>

           <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className={
             isLightMode
              ? 'mt-2 w-full border-0 bg-transparent p-0 text-base font-semibold text-slate-950 outline-none'
              : 'mt-2 w-full border-0 bg-transparent p-0 text-base font-semibold text-white outline-none'
            }
           />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
           {standNumber ? (
            <>
             <div className={isLightMode ? 'rounded-2xl border border-slate-200 bg-white/70 p-4' : 'rounded-2xl border border-white/10 bg-white/[0.04] p-4'}>
              <p className={isLightMode ? 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500' : 'text-xs font-semibold uppercase tracking-[0.18em] text-white/40'}>
               {text.generatorStandNumber}
              </p>
              <p className={isLightMode ? 'mt-2 break-words text-base font-semibold text-slate-950' : 'mt-2 break-words text-base font-semibold text-white'}>
               {standNumber}
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
            </>
           ) : (
            <div className={`col-span-2 ${isLightMode ? 'rounded-2xl border border-slate-200 bg-white/70 p-4' : 'rounded-2xl border border-white/10 bg-white/[0.04] p-4'}`}>
             <p className={isLightMode ? 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500' : 'text-xs font-semibold uppercase tracking-[0.18em] text-white/40'}>
              {text.generatorInvitationCode}
             </p>
             <p className={isLightMode ? 'mt-2 break-words text-base font-semibold text-slate-950' : 'mt-2 break-words text-base font-semibold text-white'}>
              {invitationCode || '—'}
             </p>
            </div>
           )}
          </div>
         </div>

         <label className="block">
          <span className={labelClassName}>{text.generatorCardLanguage || 'Invitation card language'}</span>
          <select
           value={cardLanguage}
           onChange={(event) => setCardLanguage(event.target.value as LanguageKey)}
           className={inputClassName}
          >
           {Object.entries(translations).filter(([key]) => key !== 'ca').map(([key, bundle]) => (
            <option key={key} value={key} className="text-black">
             {bundle.ui.languageName}
            </option>
           ))}
          </select>

          <p className={`mt-1 text-xs ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
           {text.generatorCardLanguageHelp || 'This changes the invitation card and exports only.'}
          </p>
         </label>

         <div
          className={
           isLightMode
            ? 'flex items-center justify-between gap-3 rounded-[18px] border border-white/70 bg-white/72 px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl'
            : 'flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.055] px-3 py-2.5 shadow-[0_10px_26px_rgba(0,0,0,0.20)] backdrop-blur-xl'
          }
         >
          <div className="min-w-0">
           <div className={isLightMode ? 'text-xs font-medium text-slate-700' : 'text-xs font-medium text-white/70'}>
            {text.generatorLogoUpload}
           </div>

           <div className={isLightMode ? 'mt-0.5 whitespace-nowrap text-[10px] text-slate-500' : 'mt-0.5 whitespace-nowrap text-[10px] text-white/35'}>
            {text.generatorLogoHelp || 'PNG/JPG/WebP. Max 3MB. Recommended 300 × 120px min'}
           </div>

           {logoMessage ? (
            <div className="mt-1 text-[10px] text-amber-300">
             {logoMessage}
            </div>
           ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
           <label className="cursor-pointer">
            <span
             className={
              isLightMode
               ? 'inline-flex rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-white'
               : 'inline-flex rounded-lg border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-white/75 transition hover:bg-white/[0.12]'
             }
            >
             Upload
            </span>

            <input
             type="file"
             accept="image/png,image/jpeg,image/webp,image/svg+xml"
             onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
             className="hidden"
            />
           </label>

           {logoUrl ? (
            <button
             type="button"
             onClick={removeLogo}
             className={
              isLightMode
               ? 'rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100'
               : 'rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/65 hover:bg-white/[0.08]'
             }
            >
             {text.generatorRemoveLogo || 'Remove'}
            </button>
           ) : null}
          </div>
         </div>
        </div>
       </section>

       <section className={isLightMode ? 'rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl'}>
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
             className="absolute inset-0 bg-cover bg-center opacity-100"
             style={{ backgroundImage: `url("${item.backgroundImage}")` }}
            />
            <div className={isLightMode ? 'absolute inset-0 bg-white/30' : 'absolute inset-0 bg-black/30'} />
            <div className="relative">
             <div className="text-xl font-semibold">{(text.themeLabels as Partial<Record<ThemeKey, string>> | undefined)?.[key] ?? item.label}</div>

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

    <section ref={previewAreaRef} className={previewClassName}>
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />

     <div className="relative origin-center" style={{ transform: `scale(${previewScale})` }}>
      <InvitePreview
       companyName={isSessionLoading ? '' : companyName}
       standNumber={isSessionLoading ? '' : standNumber}
       invitationCode={isSessionLoading ? '' : invitationCode}
       logoUrl={isSessionLoading ? '' : logoUrl}
       registrationUrl={isSessionLoading ? '' : qrTrackingUrl}
       theme={theme}
       language={cardLanguage}
       mode={mode}
      />
     </div>
    </section>
   </div>

   <div className="pointer-events-none absolute -left-[99999px] top-0">
    <div ref={exportPreviewRef}>
     <InvitePreview
      companyName={isSessionLoading ? '' : companyName}
      standNumber={isSessionLoading ? '' : standNumber}
      invitationCode={isSessionLoading ? '' : invitationCode}
      logoUrl={isSessionLoading ? '' : logoUrl}
      registrationUrl={isSessionLoading ? '' : qrTrackingUrl}
      theme={theme}
      language={cardLanguage}
     />
    </div>

    <div ref={emailBannerExportRef}>
     <EmailBannerPreview
      companyName={isSessionLoading ? '' : companyName}
      standNumber={isSessionLoading ? '' : standNumber}
      invitationCode={isSessionLoading ? '' : invitationCode}
      logoUrl={isSessionLoading ? '' : logoUrl}
      registrationUrl={isSessionLoading ? '' : qrTrackingUrl}
      theme={theme}
      language={cardLanguage}
     />
    </div>
    <div ref={linkedinExportRef}>
     <LinkedInInvitePreview
      companyName={isSessionLoading ? '' : companyName}
      standNumber={isSessionLoading ? '' : standNumber}
      invitationCode={isSessionLoading ? '' : invitationCode}
      logoUrl={isSessionLoading ? '' : logoUrl}
      registrationUrl={isSessionLoading ? '' : qrTrackingUrl}
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
