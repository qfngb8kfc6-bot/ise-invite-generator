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

function isThemeName(value: unknown): value is ThemeName {
  return value === 'audio' || value === 'residential' || value === 'lighting'
}

function isLanguageCode(value: unknown): value is LanguageCode {
  return value === 'en' || value === 'es' || value === 'de'
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function getFirstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }

    if (typeof value === 'number') {
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

function inferTheme(record: Record<string, unknown>): ThemeName {
  const direct = getFirstString(record, ['theme', 'themeName', 'sectorTheme']).toLowerCase()
  if (isThemeName(direct)) {
    return direct
  }

  const sector = getFirstString(record, ['sector', 'category', 'division']).toLowerCase()
  if (sector.includes('light')) return 'lighting'
  if (sector.includes('resident')) return 'residential'
  return 'audio'
}

function inferLanguage(record: Record<string, unknown>): LanguageCode {
  const direct = getFirstString(record, ['language', 'lang', 'locale']).toLowerCase()
  if (isLanguageCode(direct)) {
    return direct
  }

  if (direct.startsWith('de')) return 'de'
  if (direct.startsWith('es')) return 'es'
  return 'en'
}

function buildRegistrationUrl(
  record: Record<string, unknown>,
  invitationCode: string
): string {
  const explicit = getFirstString(record, [
    'registrationUrl',
    'registration_url',
    'inviteUrl',
    'invite_url',
    'registrationLink',
    'inviteLink',
  ])

  if (explicit) {
    return explicit
  }

  const base = process.env.EBO_REGISTRATION_BASE_URL?.trim()
  if (base && invitationCode) {
    const joiner = base.includes('?') ? '&' : '?'
    return `${base}${joiner}code=${encodeURIComponent(invitationCode)}`
  }

  return ''
}

function normaliseExhibitor(input: unknown): Exhibitor | null {
  const record = asRecord(input)
  if (!record) return null

  const id = getFirstString(record, ['id', 'exhibitorId', 'exhibitor_id', 'companyId', 'company_id'])
  const companyName = getFirstString(record, [
    'companyName',
    'company_name',
    'name',
    'exhibitorName',
    'exhibitor_name',
  ])
  const standNumber = getFirstString(record, [
    'standNumber',
    'stand_number',
    'stand',
    'booth',
    'boothNumber',
    'booth_number',
  ])
  const invitationCode = getFirstString(record, [
    'invitationCode',
    'invitation_code',
    'inviteCode',
    'invite_code',
    'code',
  ])
  const logoUrl = getFirstNullableString(record, [
    'logoUrl',
    'logo_url',
    'logo',
    'imageUrl',
    'image_url',
  ])
  const theme = inferTheme(record)
  const language = inferLanguage(record)
  const registrationUrl = buildRegistrationUrl(record, invitationCode)

  if (!id || !companyName || !standNumber || !invitationCode || !registrationUrl) {
    return null
  }

  return {
    id,
    companyName,
    standNumber,
    invitationCode,
    registrationUrl,
    logoUrl,
    theme,
    language,
  }
}

function extractCandidatePayloads(data: unknown): unknown[] {
  const record = asRecord(data)
  if (!record) return [data]

  const candidates: unknown[] = [
    record.exhibitor,
    record.data,
    record.result,
    record.item,
    data,
  ]

  const nestedData = asRecord(record.data)
  if (nestedData) {
    candidates.push(nestedData.exhibitor, nestedData.item)
  }

  return candidates.filter(Boolean)
}

async function fetchExhibitorFromEbo(id: string): Promise<Exhibitor | null> {
  const baseUrl = process.env.EBO_API_BASE_URL?.trim()
  const apiKey = process.env.EBO_API_KEY?.trim()
  const timeoutMs = Number(process.env.EBO_API_TIMEOUT_MS || '10000')

  if (!baseUrl) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/exhibitors/${encodeURIComponent(id)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`EBO exhibitor fetch failed with status ${response.status}`)
    }

    const data = await response.json()

    for (const candidate of extractCandidatePayloads(data)) {
      const exhibitor = normaliseExhibitor(candidate)
      if (exhibitor) {
        return exhibitor
      }
    }

    throw new Error('EBO exhibitor payload was invalid')
  } finally {
    clearTimeout(timeout)
  }
}

function getMockExhibitorById(id: string): Exhibitor | null {
  return mockExhibitors[id] ?? null
}

export async function getExhibitorById(id: string): Promise<Exhibitor | null> {
  const normalisedId = id.trim()
  if (!normalisedId) {
    return null
  }

  const source = process.env.EXHIBITOR_DATA_SOURCE?.trim() || 'mock'

  if (source === 'mock') {
    return getMockExhibitorById(normalisedId)
  }

  try {
    const exhibitor = await fetchExhibitorFromEbo(normalisedId)
    if (exhibitor) {
      return exhibitor
    }
  } catch (error) {
    console.error('EBO EXHIBITOR FETCH ERROR:', error)

    if (process.env.NODE_ENV === 'production') {
      return null
    }
  }

  return getMockExhibitorById(normalisedId)
}

export async function getAllExhibitors(): Promise<Exhibitor[]> {
  return Object.values(mockExhibitors)
}