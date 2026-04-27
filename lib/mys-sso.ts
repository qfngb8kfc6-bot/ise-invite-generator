import 'server-only'

import { env } from '@/lib/env'

export type MysSsoIdentity = {
  exhibitorId: string
  emailAddress: string | null
  showCode: string
  valueGuid: string
}

function isDevelopment() {
  return process.env.NODE_ENV !== 'production'
}

function debugLog(label: string, payload: Record<string, unknown>) {
  if (!isDevelopment()) {
    return
  }

  console.log(`[MYS SSO DEBUG] ${label}`, payload)
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

function getMysBaseUrl(): string {
  const baseUrl = env.MYS_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('Missing MYS_API_BASE_URL')
  }

  return baseUrl.replace(/\/+$/, '')
}

function getMysCredentials() {
  const username = env.MYS_API_USERNAME?.trim()
  const password = env.MYS_API_PASSWORD?.trim()

  if (!username || !password) {
    throw new Error('MYS API credentials are not fully configured')
  }

  return {
    username,
    password,
  }
}

function getTimeoutMs(): number {
  const raw = Number(env.MYS_API_TIMEOUT_MS || '10000')

  if (!Number.isFinite(raw) || raw <= 0) {
    return 10000
  }

  return raw
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

function extractAuthorizeToken(parsed: unknown): string {
  const readToken = (value: unknown): string => {
    const record = asRecord(value)
    if (!record) {
      return ''
    }

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
      const token = readToken(item)
      if (token) {
        return token
      }
    }
    return ''
  }

  return readToken(parsed)
}

export async function authorizeMysForShow(showCode: string): Promise<string> {
  const cleanShowCode = showCode.trim()

  if (!cleanShowCode) {
    throw new Error('Missing show code for MYS SSO authorize')
  }

  const baseUrl = getMysBaseUrl()
  const { username, password } = getMysCredentials()
  const timeoutMs = getTimeoutMs()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const authorizeUrl = new URL(`${baseUrl}/Authorize`)
    authorizeUrl.searchParams.set('showCode', cleanShowCode)

    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')

    debugLog('AUTHORIZE_REQUEST', {
      url: authorizeUrl.toString(),
      showCode: cleanShowCode,
      usernamePresent: Boolean(username),
      passwordPresent: Boolean(password),
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

      return token
    }

    const parsed = safeJsonParse(trimmed)

    if (!parsed) {
      throw new Error(`MYS authorize returned unreadable response: ${trimmed}`)
    }

    const token = extractAuthorizeToken(parsed)

    if (!token) {
      throw new Error(`MYS authorize returned an invalid response: ${trimmed}`)
    }

    return token
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`MYS authorize timed out after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function parseGuidsValueString(value: string): { exhibitorId: string; emailAddress: string | null } {
  const trimmed = value.trim()

  if (!trimmed) {
    return { exhibitorId: '', emailAddress: null }
  }

  const pipeParts = trimmed.split('|').map((part) => part.trim()).filter(Boolean)

  if (pipeParts.length >= 2) {
    const exhibitorId = pipeParts[0]
    const emailAddress = pipeParts[1] || null

    return {
      exhibitorId,
      emailAddress,
    }
  }

  const emailMatch = trimmed.match(
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i
  )
  const exhibitorMatch = trimmed.match(/\b\d+\b/)

  return {
    exhibitorId: exhibitorMatch?.[0] || '',
    emailAddress: emailMatch?.[1] || null,
  }
}

function extractGuidsIdentity(parsed: unknown, showCode: string, valueGuid: string): MysSsoIdentity | null {
  const buildIdentity = (
    exhibitorId: string,
    emailAddress: string | null
  ): MysSsoIdentity | null => {
    const cleanExhibitorId = exhibitorId.trim()

    if (!cleanExhibitorId) {
      return null
    }

    return {
      exhibitorId: cleanExhibitorId,
      emailAddress: emailAddress?.trim() || null,
      showCode,
      valueGuid,
    }
  }

  const readIdentityFromRecord = (record: Record<string, unknown>): MysSsoIdentity | null => {
    const directExhibitorId = getFirstString(record, [
      'ExhID',
      'exhID',
      'exhid',
      'exhibitorId',
      'id',
    ])

    const directEmail = getFirstString(record, [
      'EmailAddress',
      'emailAddress',
      'email',
    ])

    if (directExhibitorId) {
      return buildIdentity(directExhibitorId, directEmail || null)
    }

    const value = getFirstString(record, ['value', 'Value'])

    if (value) {
      const parsedValue = parseGuidsValueString(value)
      return buildIdentity(parsedValue.exhibitorId, parsedValue.emailAddress)
    }

    const nestedCandidates: unknown[] = [
      record['guids'],
      record['GUIDs'],
      record['data'],
      record['Data'],
      record['results'],
      record['Results'],
      record['items'],
      record['Items'],
    ]

    for (const nested of nestedCandidates) {
      const identity = extractGuidsIdentity(nested, showCode, valueGuid)
      if (identity) {
        return identity
      }
    }

    return null
  }

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const identity = extractGuidsIdentity(item, showCode, valueGuid)
      if (identity) {
        return identity
      }
    }

    return null
  }

  const record = asRecord(parsed)

  if (!record) {
    if (typeof parsed === 'string') {
      const parsedValue = parseGuidsValueString(parsed)
      return buildIdentity(parsedValue.exhibitorId, parsedValue.emailAddress)
    }

    return null
  }

  return readIdentityFromRecord(record)
}

export async function resolveMysSsoIdentity(
  valueGuid: string,
  showCode: string
): Promise<MysSsoIdentity> {
  const cleanValueGuid = valueGuid.trim()
  const cleanShowCode = showCode.trim()

  if (!cleanValueGuid) {
    throw new Error('Missing valueguid for MYS SSO')
  }

  if (!cleanShowCode) {
    throw new Error('Missing showid for MYS SSO')
  }

  const mysGuid = await authorizeMysForShow(cleanShowCode)

  const baseUrl = getMysBaseUrl()
  const timeoutMs = getTimeoutMs()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const guidUrl = new URL(`${baseUrl}/GUIDs`)
    guidUrl.searchParams.set('valueguid', cleanValueGuid)

    debugLog('GUIDS_REQUEST', {
      url: guidUrl.toString(),
      showCode: cleanShowCode,
      valueGuid: cleanValueGuid,
      mysGuidPresent: Boolean(mysGuid),
    })

    const response = await fetch(guidUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${mysGuid}`,
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    const rawText = await safeReadText(response)

    debugLog('GUIDS_RESPONSE', {
      status: response.status,
      ok: response.ok,
      bodyPreview: rawText.slice(0, 500),
    })

    if (!response.ok) {
      throw new Error(`MYS GUIDs failed with status ${response.status}: ${rawText}`)
    }

    const parsed = safeJsonParse(rawText)
    const identity = extractGuidsIdentity(parsed ?? rawText, cleanShowCode, cleanValueGuid)

    if (!identity) {
      throw new Error(`MYS GUIDs returned an unusable response: ${rawText}`)
    }

    return identity
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`MYS GUIDs timed out after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}