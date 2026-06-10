import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { getExhibitorById } from '@/lib/exhibitors'
import { signExhibitorToken } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function getTimeoutMs(): number {
  const parsed = Number(env.MYS_API_TIMEOUT_MS || '10000')
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs())

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function authoriseWithMys(showCode: string): Promise<string> {
  const baseUrl = trimTrailingSlash(env.MYS_API_BASE_URL)
  const username = env.MYS_API_USERNAME
  const password = env.MYS_API_PASSWORD

  if (!baseUrl || !username || !password) {
    throw new Error('MYS API credentials are not fully configured')
  }

  const url = new URL(`${baseUrl}/Authorize`)
  url.searchParams.set('showCode', showCode)

  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')

  const response = await fetchWithTimeout(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
  })

  const rawText = (await response.text()).trim()

  if (!response.ok) {
    throw new Error(`MYS Authorize failed with status ${response.status}`)
  }

  if (!rawText) {
    throw new Error('MYS Authorize returned an empty response')
  }

  if (!rawText.startsWith('{') && !rawText.startsWith('[')) {
    return rawText.replace(/^"+|"+$/g, '').trim()
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('MYS Authorize returned invalid JSON')
  }

  const findToken = (value: unknown): string => {
    if (!value || typeof value !== 'object') {
      return ''
    }

    const record = value as Record<string, unknown>

    for (const key of [
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
    ]) {
      const candidate = record[key]

      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim()
      }
    }

    return ''
  }

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const token = findToken(item)
      if (token) return token
    }
  } else {
    const token = findToken(parsed)
    if (token) return token
  }

  throw new Error('MYS Authorize did not return a usable token')
}

function findGuidValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findGuidValue(item)
      if (result) return result
    }

    return ''
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const record = value as Record<string, unknown>

  for (const key of [
    'value',
    'Value',
    'guidValue',
    'GUIDValue',
    'result',
    'Result',
    'data',
    'Data',
  ]) {
    const result = findGuidValue(record[key])
    if (result) return result
  }

  return ''
}

async function resolveValueGuid(
  valueGuid: string,
  mysToken: string
): Promise<{ exhibitorId: string; email: string }> {
  const baseUrl = trimTrailingSlash(env.MYS_API_BASE_URL)

  const url = new URL(`${baseUrl}/GUIDs`)
  url.searchParams.set('valueguid', valueGuid)

  const response = await fetchWithTimeout(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${mysToken}`,
    },
  })

  const rawText = (await response.text()).trim()

  if (!response.ok) {
    throw new Error(
      `MYS GUID verification failed with status ${response.status}: ${rawText.slice(0, 500)}`
    )
  }

  if (!rawText) {
    throw new Error('MYS GUID verification returned an empty response')
  }

  let resolvedValue = rawText.replace(/^"+|"+$/g, '').trim()

  if (rawText.startsWith('{') || rawText.startsWith('[')) {
    try {
      resolvedValue = findGuidValue(JSON.parse(rawText))
    } catch {
      throw new Error('MYS GUID verification returned invalid JSON')
    }
  }

  if (!resolvedValue) {
    throw new Error('MYS GUID response did not contain an identity')
  }

  const [rawExhibitorId, rawEmail = ''] = resolvedValue.split('|')

  const exhibitorId = rawExhibitorId?.trim()
  const email = rawEmail?.trim()

  if (!exhibitorId) {
    throw new Error('MYS GUID response did not contain an exhibitor ID')
  }

  return {
    exhibitorId,
    email,
  }
}

function errorRedirect(
  request: NextRequest,
  reason: string
): NextResponse {
  const url = new URL('/sso-error', request.url)
  url.searchParams.set('reason', reason)

  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  try {
    const valueGuid =
      request.nextUrl.searchParams.get('valueguid') ||
      request.nextUrl.searchParams.get('valueGUID')

    const showId =
      request.nextUrl.searchParams.get('showid') ||
      request.nextUrl.searchParams.get('showId')

    if (!valueGuid || !showId) {
      return errorRedirect(request, 'missing_parameters')
    }

    if (
      env.MYS_SHOWCODE &&
      showId.toLowerCase() !== env.MYS_SHOWCODE.toLowerCase()
    ) {
      return errorRedirect(request, 'invalid_show')
    }

    const authorisedShowCode = env.MYS_SHOWCODE || showId
    const mysToken = await authoriseWithMys(authorisedShowCode)

    const { exhibitorId } = await resolveValueGuid(
      valueGuid,
      mysToken
    )

    const exhibitor = await getExhibitorById(exhibitorId)

    if (!exhibitor) {
      return errorRedirect(request, 'exhibitor_not_found')
    }

    const token = await signExhibitorToken(exhibitor.id)

    const baseUrl = trimTrailingSlash(env.NEXT_PUBLIC_APP_URL)

    const destination =
      `${baseUrl}/generator?token=${encodeURIComponent(token)}`

    return NextResponse.redirect(destination)
  } catch (error) {
    console.error(
      'MYS SSO LAUNCH ERROR:',
      error instanceof Error ? error.message : 'Unknown error'
    )

    return errorRedirect(request, 'verification_failed')
  }
}
