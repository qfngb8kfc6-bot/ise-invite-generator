import 'server-only'
import { google } from 'googleapis'

function getPrivateKey() {
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY

  if (!key) {
    throw new Error('Missing GOOGLE_SHEETS_PRIVATE_KEY')
  }

  return key.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
}

export async function appendSecondaryInvitationRequest(values: string[]) {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const requestsSheet = process.env.GOOGLE_SHEETS_REQUESTS_SHEET || 'Requests'

  if (!clientEmail) throw new Error('Missing GOOGLE_SHEETS_CLIENT_EMAIL')
  if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID')

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

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
