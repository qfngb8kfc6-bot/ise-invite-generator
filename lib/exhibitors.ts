import 'server-only'

import { env } from '@/lib/env'

export type ThemeName = 'audio' | 'residential' | 'lighting'
export type LanguageCode = 'en' | 'es' | 'de'

export type Exhibitor = {
  id: string
  companyName: string
  standNumber: string
  invitationCode: string
  registrationUrl: string
  logoUrl: string | null
  theme: ThemeName
  language: LanguageCode
}

const mockExhibitors: Record<string, Exhibitor> = {
  '1001': {
    id: '1001',
    companyName: 'Acme Audio Ltd',
    standNumber: 'A12',
    invitationCode: 'ACME-A12-2026',
    registrationUrl: 'https://example.com/register/ACME-A12-2026',
    logoUrl: null,
    theme: 'audio',
    language: 'en',
  },
  '1002': {
    id: '1002',
    companyName: 'Luma Living',
    standNumber: 'R08',
    invitationCode: 'LUMA-R08-2026',
    registrationUrl: 'https://example.com/register/LUMA-R08-2026',
    logoUrl: null,
    theme: 'residential',
    language: 'de',
  },
  '1003': {
    id: '1003',
    companyName: 'Northlight Systems',
    standNumber: 'L21',
    invitationCode: 'NORTH-L21-2026',
    registrationUrl: 'https://example.com/register/NORTH-L21-2026',
    logoUrl: null,
    theme: 'lighting',
    language: 'es',
  },
}

function isDevelopment() {
  return process.env.NODE_ENV !== 'production'
}

function debugLog(label: string, payload: Record<string, unknown>) {
  if (!isDevelopment()) {
    return
  }

  console.log(`[MYS DEBUG] ${label}`, payload)
}

function warnLog(label: string, payload: Record<string, unknown>) {
  console.warn(`[MYS WARN] ${label}`, payload)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function getFirstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return ''
}

function getFirstNullableString(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  const value = getFirstString(record, keys)
  return value || null
}

function getMysPrimaryBoothNumber(record: Record<string, unknown>): string {
  const booths = record['booths']

  if (!Array.isArray(booths) || booths.length === 0) {
    return ''
  }

  for (const booth of booths) {
    const boothRecord = asRecord(booth)
    if (!boothRecord) continue

    const boothNumber = getFirstString(boothRecord, ['boothnumber', 'boothNumber'])

    if (boothNumber) {
      return boothNumber
    }
  }

  return ''
}

function getMysCategorySummary(record: Record<string, unknown>): string {
  const productCategories = record['productcategories']

  if (!Array.isArray(productCategories)) {
    return ''
  }

  const names: string[] = []

  for (const item of productCategories) {
    const itemRecord = asRecord(item)
    if (!itemRecord) continue

    const name = getFirstString(itemRecord, [
      'categorydisplay',
      'categoryname',
      'categoryDisplay',
      'categoryName',
    ])

    if (name) {
      names.push(name)
    }
  }

  return names.join(' ')
}

function buildFallbackInvitationCode(exhibitorId: string, standNumber: string): string {
  const year = new Date().getUTCFullYear()
  const standPart = standNumber ? standNumber.replace(/\s+/g, '').toUpperCase() : 'INVITE'
  return `${exhibitorId}-${standPart}-${year}`
}

function inferThemeFromMys(record: Record<string, unknown>): ThemeName {
  const categoryText = getMysCategorySummary(record).toLowerCase()

  if (categoryText.includes('light')) return 'lighting'

  if (
    categoryText.includes('home') ||
    categoryText.includes('residential') ||
    categoryText.includes('automation')
  ) {
    return 'residential'
  }

  return 'audio'
}

function buildRegistrationUrl(
  record: Record<string, unknown>,
  invitationCode: string,
  exhibitorId: string
): string {
  const explicit = getFirstString(record, [
    'registrationUrl',
    'registration_url',
    'inviteUrl',
    'invite_url',
    'registrationLink',
    'inviteLink',
    'inviteurl',
  ])

  if (explicit) {
    return explicit
  }

  const base = env.EBO_REGISTRATION_BASE_URL?.trim() || ''
  if (!base) {
    return ''
  }

  const joiner = base.includes('?') ? '&' : '?'

  if (invitationCode) {
    return `${base}${joiner}code=${encodeURIComponent(invitationCode)}`
  }

  return `${base}${joiner}exhibitorId=${encodeURIComponent(exhibitorId)}`
}

function normaliseMysExhibitor(input: unknown): Exhibitor | null {
  const outer = asRecord(input)
  if (!outer) return null

  const record = asRecord(outer.exhibitor) ?? outer
  if (!record) return null

  const id = getFirstString(record, ['exhid', 'id', 'exhibitorId', 'alt_id'])
  const companyName = getFirstString(record, ['exhname', 'legal_name', 'companyName', 'name'])
  const standNumber = getMysPrimaryBoothNumber(record)

  const invitationCode =
    getFirstString(record, ['promocode', 'promoCode', 'invitecode', 'invitationCode']) ||
    buildFallbackInvitationCode(id, standNumber)

  const registrationUrl = buildRegistrationUrl(record, invitationCode, id)

  const logoUrl =
    getFirstNullableString(record, ['colorlogo', 'logo', 'logoUrl', 'imageUrl']) || null

  if (!id || !companyName || !standNumber || !registrationUrl) {
    return null
  }

  return {
    id,
    companyName,
    standNumber,
    invitationCode,
    registrationUrl,
    logoUrl,
    theme: inferThemeFromMys(record),
    language: 'en',
  }
}

function getTimeoutMs(): number {
  const raw = Number(env.MYS_API_TIMEOUT_MS || '10000')

  if (!Number.isFinite(raw) || raw <= 0) {
    return 10000
  }

  return raw
}

function getMysBaseUrl(): string {
  const baseUrl = env.MYS_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('Missing MYS_API_BASE_URL')
  }

  return baseUrl.replace(/\/+$/, '')
}

function getMysRequiredCredentials() {
  const username = env.MYS_API_USERNAME?.trim()
  const password = env.MYS_API_PASSWORD?.trim()
  const showCode = env.MYS_SHOWCODE?.trim()

  if (!username || !password || !showCode) {
    throw new Error('MYS API credentials are not fully configured')
  }

  return {
    username,
    password,
    showCode,
  }
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text()
  } catch {
    return ''
  }
}

function safeJsonParse(rawText: string): unknown {
  try {
    return JSON.parse(rawText)
  } catch {
    return null
  }
}

async function authorizeMys(): Promise<string> {
  const baseUrl = getMysBaseUrl()
  const { username, password, showCode } = getMysRequiredCredentials()
  const timeoutMs = getTimeoutMs()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const authorizeUrl = new URL(`${baseUrl}/Authorize`)
    authorizeUrl.searchParams.set('showCode', showCode)

    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')

    debugLog('AUTHORIZE_REQUEST', {
      url: authorizeUrl.toString(),
      usernamePresent: Boolean(username),
      passwordPresent: Boolean(password),
      showCode,
    })

    const response = await fetch(authorizeUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    const rawText = await safeReadText(response)

    debugLog('AUTHORIZE_RESPONSE', {
      status: response.status,
      ok: response.ok,
      bodyPreview: rawText.slice(0, 500),
    })

    if (!response.ok) {
      throw new Error(`MYS authorize failed with status ${response.status}: ${rawText}`)
    }

    const trimmed = rawText.trim()

    if (!trimmed) {
      throw new Error('MYS authorize returned an empty response')
    }

    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      const token = trimmed.replace(/^"+|"+$/g, '')

      if (!token) {
        throw new Error('MYS authorize returned an empty token')
      }

      debugLog('AUTHORIZE_TOKEN_PARSED', {
        tokenPresent: true,
        tokenLength: token.length,
        source: 'plain-text',
      })

      return token
    }

    const parsed = safeJsonParse(trimmed)

    if (!parsed) {
      throw new Error(`MYS authorize returned unreadable response: ${trimmed}`)
    }

    const extractToken = (value: unknown): string => {
      const record = asRecord(value)
      if (!record) return ''

      return getFirstString(record, [
        'mysGUID',
        'mysguid',
        'MYSGUID',
        'token',
        'access_token',
        'accessToken',
        'guid',
        'GUID',
        'value',
        'Value',
      ])
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const token = extractToken(item)

        if (token) {
          debugLog('AUTHORIZE_TOKEN_PARSED', {
            tokenPresent: true,
            tokenLength: token.length,
            source: 'array',
          })

          return token
        }
      }
    } else {
      const token = extractToken(parsed)

      if (token) {
        debugLog('AUTHORIZE_TOKEN_PARSED', {
          tokenPresent: true,
          tokenLength: token.length,
          source: 'object',
        })

        return token
      }
    }

    throw new Error(`MYS authorize returned an invalid response: ${trimmed}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`MYS authorize timed out after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchExhibitorFromMys(id: string): Promise<Exhibitor | null> {
  const baseUrl = getMysBaseUrl()
  const { showCode } = getMysRequiredCredentials()
  const timeoutMs = getTimeoutMs()

  const mysGUID = await authorizeMys()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const exhibitorsUrl = new URL(`${baseUrl}/Exhibitors`)
    exhibitorsUrl.searchParams.set('showCode', showCode)
    exhibitorsUrl.searchParams.set('mysGUID', mysGUID)
    exhibitorsUrl.searchParams.set('exhid', id)

    debugLog('EXHIBITORS_REQUEST', {
      url: exhibitorsUrl.toString(),
      exhibitorId: id,
      showCode,
      mysGuidPresent: Boolean(mysGUID),
      authorizationHeaderPresent: true,
    })

    const response = await fetch(exhibitorsUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${mysGUID}`,
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    const rawText = await safeReadText(response)

    debugLog('EXHIBITORS_RESPONSE', {
      status: response.status,
      ok: response.ok,
      exhibitorId: id,
      bodyPreview: rawText.slice(0, 1000),
    })

    if (!response.ok) {
      throw new Error(`Exhibitors fetch failed: ${response.status} - ${rawText}`)
    }

    const data = safeJsonParse(rawText)

    if (!Array.isArray(data)) {
      throw new Error(`Exhibitors returned unexpected response: ${rawText.slice(0, 500)}`)
    }

    for (const item of data) {
      const exhibitor = normaliseMysExhibitor(item)

      if (exhibitor && exhibitor.id === id) {
        debugLog('EXHIBITOR_NORMALISED', {
          exhibitorId: exhibitor.id,
          companyName: exhibitor.companyName,
          standNumber: exhibitor.standNumber,
          registrationUrlPresent: Boolean(exhibitor.registrationUrl),
          invitationCodePresent: Boolean(exhibitor.invitationCode),
        })

        return exhibitor
      }
    }

    debugLog('EXHIBITOR_NOT_FOUND_IN_RESPONSE', {
      exhibitorId: id,
      arrayLength: data.length,
    })

    return null
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Exhibitors request timed out after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function getMockExhibitorById(id: string): Exhibitor | null {
  return mockExhibitors[id] ?? null
}

function shouldUseMockFallback() {
  return isDevelopment()
}

export async function getExhibitorById(id: string): Promise<Exhibitor | null> {
  const normalisedId = id.trim()

  if (!normalisedId) {
    return null
  }

  const source = env.EXHIBITOR_DATA_SOURCE?.trim() || 'mock'

  if (source !== 'mys') {
    return getMockExhibitorById(normalisedId)
  }

  try {
    const exhibitor = await fetchExhibitorFromMys(normalisedId)

    if (exhibitor) {
      return exhibitor
    }

    if (shouldUseMockFallback()) {
      warnLog('FALLBACK_TO_MOCK_AFTER_MYS_NOT_FOUND', {
        exhibitorId: normalisedId,
      })

      return getMockExhibitorById(normalisedId)
    }

    return null
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MYS error'

    warnLog('MYS_FETCH_FAILED', {
      exhibitorId: normalisedId,
      message,
      fallbackToMock: shouldUseMockFallback(),
    })

    if (shouldUseMockFallback()) {
      return getMockExhibitorById(normalisedId)
    }

    return null
  }
}

export async function getAllExhibitors(): Promise<Exhibitor[]> {
  return Object.values(mockExhibitors)
}