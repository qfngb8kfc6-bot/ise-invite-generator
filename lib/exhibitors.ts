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

function normaliseString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normaliseNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function mapUnknownTheme(value: unknown): ThemeName {
  return isThemeName(value) ? value : 'audio'
}

function mapUnknownLanguage(value: unknown): LanguageCode {
  return isLanguageCode(value) ? value : 'en'
}

function validateExhibitor(input: unknown): Exhibitor | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const record = input as Record<string, unknown>

  const id = normaliseString(record.id)
  const companyName = normaliseString(record.companyName)
  const standNumber = normaliseString(record.standNumber)
  const invitationCode = normaliseString(record.invitationCode)
  const registrationUrl = normaliseString(record.registrationUrl)
  const logoUrl = normaliseNullableString(record.logoUrl)
  const theme = mapUnknownTheme(record.theme)
  const language = mapUnknownLanguage(record.language)

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

function getMockExhibitorById(id: string): Exhibitor | null {
  return mockExhibitors[id] ?? null
}

async function fetchExhibitorFromEbo(id: string): Promise<Exhibitor | null> {
  const eboBaseUrl = process.env.EBO_API_BASE_URL?.trim()
  const eboApiKey = process.env.EBO_API_KEY?.trim()

  if (!eboBaseUrl) {
    return null
  }

  const url = `${eboBaseUrl.replace(/\/+$/, '')}/exhibitors/${encodeURIComponent(id)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(eboApiKey ? { Authorization: `Bearer ${eboApiKey}` } : {}),
    },
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`EBO exhibitor fetch failed with status ${response.status}`)
  }

  const data = await response.json()

  const exhibitor =
    validateExhibitor(data?.exhibitor) ??
    validateExhibitor(data)

  if (!exhibitor) {
    throw new Error('EBO exhibitor payload was invalid')
  }

  return exhibitor
}

export async function getExhibitorById(id: string): Promise<Exhibitor | null> {
  const normalisedId = id.trim()

  if (!normalisedId) {
    return null
  }

  const useMockOnly = process.env.EXHIBITOR_DATA_SOURCE?.trim() === 'mock'

  if (useMockOnly) {
    return getMockExhibitorById(normalisedId)
  }

  try {
    const eboExhibitor = await fetchExhibitorFromEbo(normalisedId)

    if (eboExhibitor) {
      return eboExhibitor
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