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

function describeError(error: unknown) {
  const err = (error ?? {}) as {
    name?: unknown
    message?: unknown
    code?: unknown
    status?: unknown
    response?: {
      status?: unknown
      data?: { error?: { status?: unknown; message?: unknown } }
    }
  }

  return {
    name: err.name,
    message: err.message,
    code: err.code,
    googleStatus: err.response?.status ?? err.status,
    googleReason: err.response?.data?.error?.status,
    googleMessage: err.response?.data?.error?.message,
  }
}

function requestFailedPage(requestId: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>We couldn't complete your request</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #020617; color: #e2e8f0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; padding: 24px; box-sizing: border-box; }
  main { max-width: 520px; }
  h1 { color: #fff; font-size: 1.75rem; margin: 0 0 16px; }
  p { line-height: 1.6; color: rgba(226, 232, 240, 0.75); margin: 0 0 12px; }
  code { color: #fff; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 6px; }
  a { display: inline-block; margin-top: 16px; padding: 12px 20px; border-radius: 16px; background: #2563eb; color: #fff; font-weight: 600; text-decoration: none; }
  a:hover { background: #3b82f6; }
</style>
</head>
<body>
<main>
  <h1>We couldn't complete your request</h1>
  <p>Something went wrong on our side and your invitation generator was not created. Please try again in a few minutes.</p>
  <p>If the problem continues, please contact the ISE team and quote reference <code>${requestId}</code>.</p>
  <a href="/request-invitation">Back to request form</a>
</main>
</body>
</html>`

  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
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

  try {
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
  } catch (error) {
    console.error(
      '[SECONDARY REQUEST ERROR] Failed to save request to Google Sheets',
      JSON.stringify({ requestId, submittedAt, ...describeError(error) })
    )
    return requestFailedPage(requestId)
  }

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
