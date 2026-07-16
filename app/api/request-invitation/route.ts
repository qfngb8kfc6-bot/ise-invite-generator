import { redirect } from 'next/navigation'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import {
  appendSecondaryInvitationRequest,
  buildSecondaryGeneratorUrl,
} from '@/lib/google-sheets'
import { logAnalyticsEvent } from '@/lib/analytics'
import type { LanguageKey, ThemeKey } from '@/lib/types'

function getUiString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_LOGO_BYTES = 3 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
])

function isThemeKey(value: string): value is ThemeKey {
  return value in themes
}

function isLanguageKey(value: string): value is LanguageKey {
  return value in translations
}

function badRequest(message: string) {
  return new Response(message, {
    status: 400,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

function createRequestId() {
  return `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(request: Request) {
  const formData = await request.formData()

  const requestId = createRequestId()
  const submittedAt = new Date().toISOString()

  const companyName = String(formData.get('companyName') || '').trim()
  const contactName = String(formData.get('contactName') || '').trim()
  const contactEmail = String(formData.get('contactEmail') || '').trim()
  const themeRaw = String(formData.get('theme') || '').trim()
  const languageRaw = String(formData.get('language') || '').trim()
  const logo = formData.get('logo')

  if (!companyName || companyName.length < 2) {
    return badRequest('Company name is required.')
  }

  if (!contactName || contactName.length < 2) {
    return badRequest('Contact name is required.')
  }

  if (!contactEmail || !contactEmail.includes('@')) {
    return badRequest('Valid contact email is required.')
  }

  if (!isThemeKey(themeRaw)) {
    return badRequest('Please choose a valid sector image.')
  }

  if (!isLanguageKey(languageRaw)) {
    return badRequest('Please choose a valid invitation language.')
  }

  const hasLogo = logo instanceof File && logo.size > 0

  if (hasLogo && !ALLOWED_MIME_TYPES.has(logo.type)) {
    return badRequest('Logo must be PNG, JPG, WEBP or SVG.')
  }

  if (hasLogo && logo.size > MAX_LOGO_BYTES) {
    return badRequest('Logo is too large. Maximum size is 3MB.')
  }

  const generatorUrl = buildSecondaryGeneratorUrl(requestId)

  await appendSecondaryInvitationRequest({
    requestId,
    submittedAt,
    companyName,
    contactName,
    contactEmail,
    logoUrl: '',
    themeLabel: themes[themeRaw].label,
    languageLabel: getUiString(translations[languageRaw].ui.languageName, languageRaw),
    generatorUrl,
  })

  try {
    await logAnalyticsEvent({
      exhibitorId: `secondary:${requestId}`,
      companyName,
      eventType: 'link_generated',
      metadata: {
        flow: 'secondary',
        requestId,
        generatorUrl,
        preferredTheme: themeRaw,
        preferredLanguage: languageRaw,
        preferredLogoSubmitted: hasLogo,
      },
    })
  } catch (error) {
    console.warn('[SECONDARY ANALYTICS WARNING] Failed to log link generation', error)
  }

  redirect(`/request-invitation/success?requestId=${encodeURIComponent(requestId)}`)
}
