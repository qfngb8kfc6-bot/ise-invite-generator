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

export type NewSecondaryInvitationRequestInput = {
  requestId: string
  submittedAt: string
  companyName: string
  contactName: string
  contactEmail: string
  logoUrl: string
  themeLabel: string
  languageLabel: string
  generatorUrl: string
}

/**
 * ISE SHEET ADAPTER
 * -----------------
 * This is the only section that should need changing when ISE provides
 * their final Google Sheet.
 *
 * Current prototype Requests sheet columns:
 * A Request ID
 * B Submitted At
 * C Company Name
 * D Contact Name
 * E Contact Email
 * F Logo URL
 * G Sector / Theme
 * H Language
 * I Status
 * J Assigned Invitation ID
 * K Assigned Invitation Code
 * L Generator URL
 * M Reviewed By
 * N Assigned Date
 * O Notes
 * P Notes / extra notes
 */
const REQUEST_COLUMNS = {
  requestId: 0,
  submittedAt: 1,
  companyName: 2,
  contactName: 3,
  contactEmail: 4,
  logoUrl: 5,
  theme: 6,
  language: 7,
  status: 8,
  assignedCodeId: 9,
  assignedInvitationCode: 10,
  generatorUrl: 11,
  reviewedBy: 12,
  assignedDate: 13,
  notes: 14,
  extraNotes: 15,
} as const

const REQUESTS_APPEND_RANGE = 'A:P'
const DEFAULT_REQUEST_STATUS = 'Approved'

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

function getCell(row: unknown[], column: keyof typeof REQUEST_COLUMNS): string {
  return normaliseCell(row[REQUEST_COLUMNS[column]])
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
    requestId: getCell(row, 'requestId'),
    submittedAt: getCell(row, 'submittedAt'),
    companyName: getCell(row, 'companyName'),
    contactName: getCell(row, 'contactName'),
    contactEmail: getCell(row, 'contactEmail'),
    logoUrl: getCell(row, 'logoUrl'),
    theme: mapTheme(getCell(row, 'theme')),
    language: mapLanguage(getCell(row, 'language')),
    status: getCell(row, 'status'),
    assignedCodeId: getCell(row, 'assignedCodeId'),
    assignedInvitationCode: getCell(row, 'assignedInvitationCode'),
    generatorUrl: getCell(row, 'generatorUrl'),
    reviewedBy: getCell(row, 'reviewedBy'),
    assignedDate: getCell(row, 'assignedDate'),
    notes: getCell(row, 'notes') || getCell(row, 'extraNotes'),
  }
}

function newRequestToSheetRow(input: NewSecondaryInvitationRequestInput): string[] {
  const row = Array(Object.keys(REQUEST_COLUMNS).length).fill('')

  row[REQUEST_COLUMNS.requestId] = input.requestId
  row[REQUEST_COLUMNS.submittedAt] = input.submittedAt
  row[REQUEST_COLUMNS.companyName] = input.companyName
  row[REQUEST_COLUMNS.contactName] = input.contactName
  row[REQUEST_COLUMNS.contactEmail] = input.contactEmail
  row[REQUEST_COLUMNS.logoUrl] = input.logoUrl
  row[REQUEST_COLUMNS.theme] = input.themeLabel
  row[REQUEST_COLUMNS.language] = input.languageLabel
  row[REQUEST_COLUMNS.status] = DEFAULT_REQUEST_STATUS
  row[REQUEST_COLUMNS.assignedCodeId] = input.requestId
  row[REQUEST_COLUMNS.assignedInvitationCode] = input.requestId
  row[REQUEST_COLUMNS.generatorUrl] = input.generatorUrl
  row[REQUEST_COLUMNS.reviewedBy] = 'Auto-approved'
  row[REQUEST_COLUMNS.assignedDate] = input.submittedAt
  row[REQUEST_COLUMNS.notes] = 'Auto-approved on submission'
  row[REQUEST_COLUMNS.extraNotes] = ''

  return row
}

export function buildSecondaryGeneratorUrl(requestId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://invitations.iseurope.org'

  return `${baseUrl.replace(/\/$/, '')}/secondary/${encodeURIComponent(requestId)}`
}

export function buildSecondaryRegistrationUrl(invitationCode: string): string {
  return `https://www.iseurope.org/welcome/registration?code=${encodeURIComponent(
    invitationCode
  )}`
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

export async function appendSecondaryInvitationRequest(
  input: NewSecondaryInvitationRequestInput
) {
  const { spreadsheetId, requestsSheet } = getSheetsConfig()
  const sheets = await getSheetsClient()

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${requestsSheet}!${REQUESTS_APPEND_RANGE}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [newRequestToSheetRow(input)],
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
    range: `${requestsSheet}!${REQUESTS_APPEND_RANGE}`,
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
