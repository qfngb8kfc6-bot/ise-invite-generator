import 'server-only'
import { google } from 'googleapis'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { LanguageKey, ThemeKey } from '@/lib/types'

export type SecondaryInvitationRequest = {
  requestId: string
  submittedAt: string
  companyName: string
  contactName: string
  contactEmail: string
  logoUrl: string
  theme: ThemeKey
  language: LanguageKey
  status: string
  assignedCodeId: string
  assignedInvitationCode: string
  generatorUrl: string
  reviewedBy: string
  assignedDate: string
  notes: string
}

function getPrivateKey() {
  const base64Key = process.env.GOOGLE_SHEETS_PRIVATE_KEY_BASE64?.trim()

  if (!base64Key) {
    throw new Error(
      'Missing GOOGLE_SHEETS_PRIVATE_KEY_BASE64. The app is not seeing the Base64 private key environment variable.'
    )
  }

  const decodedKey = Buffer.from(base64Key, 'base64').toString('utf8').trim()

  if (!decodedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error(
      'Invalid GOOGLE_SHEETS_PRIVATE_KEY_BASE64. Decoded key does not start with BEGIN PRIVATE KEY.'
    )
  }

  if (!decodedKey.endsWith('-----END PRIVATE KEY-----')) {
    throw new Error(
      'Invalid GOOGLE_SHEETS_PRIVATE_KEY_BASE64. Decoded key does not end with END PRIVATE KEY.'
    )
  }

  return `${decodedKey}\n`
}

function getSheetsConfig() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const requestsSheet = process.env.GOOGLE_SHEETS_REQUESTS_SHEET || 'Requests'

  if (!clientEmail) throw new Error('Missing GOOGLE_SHEETS_CLIENT_EMAIL')
  if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID')

  return {
    clientEmail,
    spreadsheetId,
    requestsSheet,
  }
}

async function getSheetsClient() {
  const { clientEmail } = getSheetsConfig()

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

function normaliseCell(value: unknown): string {
  return String(value ?? '').trim()
}

function normaliseLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
}

function normaliseStatus(value: string): string {
  return value.trim().toLowerCase()
}

function mapTheme(value: string): ThemeKey {
  const raw = value.trim()

  if (raw && raw in themes) {
    return raw as ThemeKey
  }

  const lookup = normaliseLookup(raw)

  for (const [key, theme] of Object.entries(themes)) {
    if (
      normaliseLookup(key) === lookup ||
      normaliseLookup(theme.label) === lookup
    ) {
      return key as ThemeKey
    }
  }

  return 'audio'
}

function mapLanguage(value: string): LanguageKey {
  const raw = value.trim()

  if (raw && raw in translations) {
    return raw as LanguageKey
  }

  const lookup = normaliseLookup(raw)

  for (const [key, bundle] of Object.entries(translations)) {
    if (
      normaliseLookup(key) === lookup ||
      normaliseLookup(bundle.ui.languageName) === lookup
    ) {
      return key as LanguageKey
    }
  }

  return 'en'
}

function rowToSecondaryInvitationRequest(row: unknown[]): SecondaryInvitationRequest {
  return {
    requestId: normaliseCell(row[0]),
    submittedAt: normaliseCell(row[1]),
    companyName: normaliseCell(row[2]),
    contactName: normaliseCell(row[3]),
    contactEmail: normaliseCell(row[4]),
    logoUrl: normaliseCell(row[5]),
    theme: mapTheme(normaliseCell(row[6])),
    language: mapLanguage(normaliseCell(row[7])),
    status: normaliseCell(row[8]),
    assignedCodeId: normaliseCell(row[9]),
    assignedInvitationCode: normaliseCell(row[10]),
    generatorUrl: normaliseCell(row[11]),
    reviewedBy: normaliseCell(row[12]),
    assignedDate: normaliseCell(row[13]),
    notes: normaliseCell(row[14]) || normaliseCell(row[15]),
  }
}

export function isSecondaryInvitationApproved(status: string): boolean {
  const normalised = normaliseStatus(status)

  return (
    normalised === 'approved' ||
    normalised === 'approve' ||
    normalised === 'assigned' ||
    normalised === 'ready' ||
    normalised === 'live'
  )
}

export async function appendSecondaryInvitationRequest(values: string[]) {
  const { spreadsheetId, requestsSheet } = getSheetsConfig()
  const sheets = await getSheetsClient()

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${requestsSheet}!A:P`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [values],
    },
  })
}

export async function getSecondaryInvitationRequestById(
  requestId: string
): Promise<SecondaryInvitationRequest | null> {
  const cleanRequestId = requestId.trim()

  if (!cleanRequestId) {
    return null
  }

  const { spreadsheetId, requestsSheet } = getSheetsConfig()
  const sheets = await getSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${requestsSheet}!A:P`,
  })

  const rows = response.data.values || []

  for (const row of rows.slice(1)) {
    const request = rowToSecondaryInvitationRequest(row)

    if (request.requestId === cleanRequestId) {
      return request
    }
  }

  return null
}
