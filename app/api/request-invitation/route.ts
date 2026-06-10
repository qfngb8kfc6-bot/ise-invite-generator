import { redirect } from 'next/navigation'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import { appendSecondaryInvitationRequest } from '@/lib/google-sheets'
import type { LanguageKey, ThemeKey } from '@/lib/types'

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

export async function POST(request: Request) {
  const formData = await request.formData()

  const requestId = crypto.randomUUID()
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

  if (!(logo instanceof File)) {
    return badRequest('Logo file is required.')
  }

  if (!ALLOWED_MIME_TYPES.has(logo.type)) {
    return badRequest('Logo must be PNG, JPG, WEBP or SVG.')
  }

  if (logo.size <= 0) {
    return badRequest('Logo file is empty.')
  }

  if (logo.size > MAX_LOGO_BYTES) {
    return badRequest('Logo is too large. Maximum size is 3MB.')
  }

  await appendSecondaryInvitationRequest([
    requestId,
    submittedAt,
    companyName,
    contactName,
    contactEmail,
    `Logo uploaded: ${logo.name || 'logo'}`,
    themes[themeRaw].label,
    translations[languageRaw].ui.languageName,
    'Pending Review',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ])

  redirect('/request-invitation/success')
}
