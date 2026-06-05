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
    invitationCode: 'ACME-A12-2027',
    registrationUrl: 'https://example.com/register/ACME-A12-2027',
    logoUrl: null,
    theme: 'audio',
    language: 'en',
  },
  '1002': {
    id: '1002',
    companyName: 'Luma Living',
    standNumber: 'R08',
    invitationCode: 'LUMA-R08-2027',
    registrationUrl: 'https://example.com/register/LUMA-R08-2027',
    logoUrl: null,
    theme: 'residential',
    language: 'de',
  },
  '1003': {
    id: '1003',
    companyName: 'Northlight Systems',
    standNumber: 'L21',
    invitationCode: 'NORTH-L21-2027',
    registrationUrl: 'https://example.com/register/NORTH-L21-2027',
    logoUrl: null,
    theme: 'lighting',
    language: 'es',
  },
}

const EXHIBITOR_CACHE_TTL_MS = 15 * 60 * 1000
const EXHIBITOR_LIST_CACHE_TTL_MS = 10 * 60 * 1000

type ExhibitorCacheEntry = {
  exhibitor: Exhibitor | null
  cachedAt: number
}

type ExhibitorListCacheEntry = {
  exhibitors: Exhibitor[]
  cachedAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __mysExhibitorCache: Map<string, ExhibitorCacheEntry> | undefined

  // eslint-disable-next-line no-var
  var __mysAllExhibitorsCache: ExhibitorListCacheEntry | undefined
}

function getExhibitorCache(): Map<string, ExhibitorCacheEntry> {
  if (!global.__mysExhibitorCache) {
    global.__mysExhibitorCache = new Map()
  }

  return global.__mysExhibitorCache
}

function getCachedExhibitor(id: string): Exhibitor | null | undefined {
  const cache = getExhibitorCache()
  const entry = cache.get(id)

  if (!entry) {
    return undefined
  }

  const isExpired = Date.now() - entry.cachedAt > EXHIBITOR_CACHE_TTL_MS

  if (isExpired) {
    cache.delete(id)
    return undefined
  }

  debugLog('CACHE_HIT', {
    exhibitorId: id,
    cachedAt: new Date(entry.cachedAt).toISOString(),
  })

  return entry.exhibitor
}

function setCachedExhibitor(id: string, exhibitor: Exhibitor | null): void {
  const cache = getExhibitorCache()

  cache.set(id, {
    exhibitor,
    cachedAt: Date.now(),
  })

  debugLog('CACHE_SET', {
    exhibitorId: id,
    found: Boolean(exhibitor),
  })
}

function getCachedAllExhibitors(): Exhibitor[] | undefined {
  const entry = global.__mysAllExhibitorsCache

  if (!entry) {
    return undefined
  }

  const isExpired = Date.now() - entry.cachedAt > EXHIBITOR_LIST_CACHE_TTL_MS

  if (isExpired) {
    global.__mysAllExhibitorsCache = undefined
    return undefined
  }

  debugLog('ALL_EXHIBITORS_CACHE_HIT', {
    count: entry.exhibitors.length,
    cachedAt: new Date(entry.cachedAt).toISOString(),
  })

  return entry.exhibitors
}

function setCachedAllExhibitors(exhibitors: Exhibitor[]): void {
  global.__mysAllExhibitorsCache = {
    exhibitors,
    cachedAt: Date.now(),
  }

  debugLog('ALL_EXHIBITORS_CACHE_SET', {
    count: exhibitors.length,
  })

  for (const exhibitor of exhibitors) {
    setCachedExhibitor(exhibitor.id, exhibitor)
  }
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

  const values: string[] = []

  for (const booth of booths) {
    const boothRecord = asRecord(booth)
    if (!boothRecord) continue

    const boothNumber = getFirstString(boothRecord, ['boothnumber', 'boothNumber'])

    if (boothNumber) {
      values.push(boothNumber)
    }
  }

  return values.join('; ')
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
const year = '2027'
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

  const id = getFirstString(record, ['exhid', 'exhID', 'id', 'exhibitorId', 'alt_id'])
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

type MysIdRow = {
  exhibitorId: string
}

function extractExhibitorIdsFromArray(items: unknown[]): MysIdRow[] {
  const rows: MysIdRow[] = []

  for (const item of items) {
    if (typeof item === 'string' || typeof item === 'number') {
      const exhibitorId = String(item).trim()
      if (exhibitorId) {
        rows.push({ exhibitorId })
      }
      continue
    }

    const record = asRecord(item)
    if (!record) continue

    const exhibitorId = getFirstString(record, [
      'exhid',
      'exhID',
      'id',
      'exhibitorId',
      'exhibitorid',
      'ExhibitorID',
      'value',
    ])

    if (exhibitorId) {
      rows.push({ exhibitorId })
      continue
    }

    const nestedCandidates: unknown[] = [
      record['exhibitorIDList'],
      record['exhibitorIdList'],
      record['ExhibitorIDList'],
      record['ids'],
      record['IDs'],
      record['items'],
      record['Items'],
      record['data'],
      record['Data'],
      record['results'],
      record['Results'],
    ]

    for (const nested of nestedCandidates) {
      if (Array.isArray(nested)) {
        rows.push(...extractExhibitorIdsFromArray(nested))
      }
    }
  }

  return rows
}

function extractExhibitorIds(parsed: unknown): MysIdRow[] {
  if (Array.isArray(parsed)) {
    return extractExhibitorIdsFromArray(parsed)
  }

  const record = asRecord(parsed)
  if (!record) {
    return []
  }

  const nestedCandidates: unknown[] = [
    record['exhibitorIDList'],
    record['exhibitorIdList'],
    record['ExhibitorIDList'],
    record['exhibitors'],
    record['Exhibitors'],
    record['data'],
    record['Data'],
    record['results'],
    record['Results'],
    record['items'],
    record['Items'],
    record['ids'],
    record['IDs'],
  ]

  for (const nested of nestedCandidates) {
    if (Array.isArray(nested)) {
      return extractExhibitorIdsFromArray(nested)
    }
  }

  return []
}

async function fetchMysExhibitorIdList(mysGUID: string): Promise<MysIdRow[]> {
  const baseUrl = getMysBaseUrl()
  const { showCode } = getMysRequiredCredentials()
  const timeoutMs = getTimeoutMs()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const candidatePaths = ['/ExhibitorIDList', '/Exhibitors/ExhibitorIDList']

  try {
    for (const path of candidatePaths) {
      const url = new URL(`${baseUrl}${path}`)
      url.searchParams.set('showCode', showCode)
      url.searchParams.set('mysGUID', mysGUID)

      debugLog('EXHIBITOR_ID_LIST_REQUEST', {
        path,
        url: url.toString(),
        showCode,
        mysGuidPresent: Boolean(mysGUID),
      })

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${mysGUID}`,
        },
        cache: 'no-store',
        signal: controller.signal,
      })

      const rawText = await safeReadText(response)

      debugLog('EXHIBITOR_ID_LIST_RESPONSE', {
        path,
        status: response.status,
        ok: response.ok,
        bodyPreview: rawText.slice(0, 1000),
      })

      if (!response.ok) {
        continue
      }

      const parsed = safeJsonParse(rawText)
      const rows = extractExhibitorIds(parsed)

      debugLog('EXHIBITOR_ID_LIST_PARSED', {
        path,
        parsedType: Array.isArray(parsed) ? 'array' : typeof parsed,
        rowCount: rows.length,
      })

      if (rows.length > 0) {
        return rows
      }
    }

    return []
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`ExhibitorIDList request timed out after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchMysExhibitorFromApi(id: string, mysGUID: string): Promise<Exhibitor | null> {
  const baseUrl = getMysBaseUrl()
  const { showCode } = getMysRequiredCredentials()
  const timeoutMs = getTimeoutMs()

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

async function runWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  worker: (item: TInput) => Promise<TOutput>
): Promise<TOutput[]> {
  const results: TOutput[] = new Array(items.length)
  let nextIndex = 0

  async function consume() {
    while (nextIndex < items.length) {
      const current = nextIndex
      nextIndex += 1
      results[current] = await worker(items[current])
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length || 1) },
    () => consume()
  )

  await Promise.all(workers)
  return results
}

function getMockExhibitorById(id: string): Exhibitor | null {
  return mockExhibitors[id] ?? null
}

function isMockFallbackAllowed(): boolean {
  return env.ALLOW_MOCK_FALLBACK
}

async function fetchAllExhibitorsFromMys(): Promise<Exhibitor[]> {
  const cached = getCachedAllExhibitors()

  if (cached) {
    return cached
  }

  const mysGUID = await authorizeMys()
  const idRows = await fetchMysExhibitorIdList(mysGUID)

  if (idRows.length === 0) {
    debugLog('ALL_EXHIBITORS_EMPTY_ID_LIST', {})
    return []
  }

  debugLog('ALL_EXHIBITORS_ID_LIST_SUCCESS', {
    idCount: idRows.length,
  })

  const details = await runWithConcurrency(idRows, 8, async (row) => {
    return await fetchMysExhibitorFromApi(row.exhibitorId, mysGUID)
  })

  const exhibitors = details.filter((item): item is Exhibitor => Boolean(item))

  debugLog('ALL_EXHIBITORS_FETCH_COMPLETE', {
    requested: idRows.length,
    valid: exhibitors.length,
  })

  if (exhibitors.length > 0) {
    setCachedAllExhibitors(exhibitors)
  }

  return exhibitors
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

  const cached = getCachedExhibitor(normalisedId)

  if (cached !== undefined) {
    return cached
  }

  try {
    const allCached = getCachedAllExhibitors()

    if (allCached) {
      const fromList = allCached.find((item) => item.id === normalisedId) ?? null
      setCachedExhibitor(normalisedId, fromList)
      return fromList
    }

    const mysGUID = await authorizeMys()
    const exhibitor = await fetchMysExhibitorFromApi(normalisedId, mysGUID)

    setCachedExhibitor(normalisedId, exhibitor)

    if (exhibitor) {
      return exhibitor
    }

    if (isMockFallbackAllowed()) {
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
      fallbackToMock: isMockFallbackAllowed(),
    })

    if (isMockFallbackAllowed()) {
      return getMockExhibitorById(normalisedId)
    }

    throw error
  }
}

export async function getAllExhibitors(): Promise<Exhibitor[]> {
  const source = env.EXHIBITOR_DATA_SOURCE?.trim() || 'mock'

  if (source !== 'mys') {
    return Object.values(mockExhibitors)
  }

  try {
    const exhibitors = await fetchAllExhibitorsFromMys()

    if (exhibitors.length > 0) {
      return exhibitors
    }

    if (isMockFallbackAllowed()) {
      warnLog('FALLBACK_TO_MOCK_AFTER_EMPTY_MYS_LIST', {})
      return Object.values(mockExhibitors)
    }

    return []
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MYS error'

    warnLog('MYS_ALL_FETCH_FAILED', {
      message,
      fallbackToMock: isMockFallbackAllowed(),
    })

    if (isMockFallbackAllowed()) {
      return Object.values(mockExhibitors)
    }

    throw error
  }
}