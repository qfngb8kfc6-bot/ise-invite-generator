import { promises as fs } from 'fs'
import path from 'path'
import { redirect } from 'next/navigation'
import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import type { LanguageKey, ThemeKey } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATA_DIR = path.join(process.cwd(), '.data')
const REQUESTS_FILE = path.join(DATA_DIR, 'public-invitation-requests.json')

const MAX_LOGO_BYTES = 3 * 1024 * 1024
const MIN_LOGO_WIDTH = 300
const MIN_LOGO_HEIGHT = 120

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
])

type LogoDimensions = {
  width: number | null
  height: number | null
}

type PublicInvitationRequest = {
  id: string
  companyName: string
  theme: ThemeKey
  language: LanguageKey
  logo: {
    filename: string
    mimeType: string
    size: number
    width: number | null
    height: number | null
    dataUrl: string
  }
  status: 'pending_code_assignment'
  source: 'secondary-widget'
  createdAt: string
  updatedAt: string
}

async function readRequests(): Promise<PublicInvitationRequest[]> {
  try {
    const raw = await fs.readFile(REQUESTS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeRequests(requests: PublicInvitationRequest[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2))
}

function isThemeKey(value: string): value is ThemeKey {
  return value in themes
}

function isLanguageKey(value: string): value is LanguageKey {
  return value in translations
}

function readPngDimensions(buffer: Buffer): LogoDimensions | null {
  if (
    buffer.length >= 24 &&
    buffer.toString('ascii', 1, 4) === 'PNG'
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    }
  }

  return null
}

function readJpegDimensions(buffer: Buffer): LogoDimensions | null {
  let offset = 2

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null
  }

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      return null
    }

    const marker = buffer[offset + 1]
    const length = buffer.readUInt16BE(offset + 2)

    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }

    offset += 2 + length
  }

  return null
}

function readWebpDimensions(buffer: Buffer): LogoDimensions | null {
  if (
    buffer.length < 30 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    return null
  }

  const format = buffer.toString('ascii', 12, 16)

  if (format === 'VP8X' && buffer.length >= 30) {
    const width =
      1 +
      buffer[24] +
      (buffer[25] << 8) +
      (buffer[26] << 16)

    const height =
      1 +
      buffer[27] +
      (buffer[28] << 8) +
      (buffer[29] << 16)

    return { width, height }
  }

  if (format === 'VP8 ' && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    }
  }

  return null
}

function readSvgDimensions(buffer: Buffer): LogoDimensions | null {
  const text = buffer.toString('utf8').slice(0, 5000)

  const widthMatch = text.match(/\bwidth=["']?([0-9.]+)/i)
  const heightMatch = text.match(/\bheight=["']?([0-9.]+)/i)

  if (widthMatch && heightMatch) {
    return {
      width: Math.round(Number(widthMatch[1])),
      height: Math.round(Number(heightMatch[1])),
    }
  }

  const viewBoxMatch = text.match(/\bviewBox=["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*["']/i)

  if (viewBoxMatch) {
    return {
      width: Math.round(Number(viewBoxMatch[1])),
      height: Math.round(Number(viewBoxMatch[2])),
    }
  }

  return null
}

function readLogoDimensions(buffer: Buffer, mimeType: string): LogoDimensions | null {
  if (mimeType === 'image/png') return readPngDimensions(buffer)
  if (mimeType === 'image/jpeg') return readJpegDimensions(buffer)
  if (mimeType === 'image/webp') return readWebpDimensions(buffer)
  if (mimeType === 'image/svg+xml') return readSvgDimensions(buffer)

  return null
}

function isGoodEnoughLogo(dimensions: LogoDimensions | null): boolean {
  if (!dimensions?.width || !dimensions?.height) {
    return false
  }

  return dimensions.width >= MIN_LOGO_WIDTH && dimensions.height >= MIN_LOGO_HEIGHT
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

  const companyName = String(formData.get('companyName') || '').trim()
  const themeRaw = String(formData.get('theme') || '').trim()
  const languageRaw = String(formData.get('language') || '').trim()
  const logo = formData.get('logo')

  if (!companyName || companyName.length < 2) {
    return badRequest('Company name is required.')
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

  const buffer = Buffer.from(await logo.arrayBuffer())
  const dimensions = readLogoDimensions(buffer, logo.type)

  if (!isGoodEnoughLogo(dimensions)) {
    return badRequest(
      `Logo is too small or unreadable. Minimum size is ${MIN_LOGO_WIDTH} × ${MIN_LOGO_HEIGHT}px.`
    )
  }

  const dataUrl = `data:${logo.type};base64,${buffer.toString('base64')}`
  const now = new Date().toISOString()

  const requests = await readRequests()

  requests.push({
    id: crypto.randomUUID(),
    companyName,
    theme: themeRaw,
    language: languageRaw,
    logo: {
      filename: logo.name || 'logo',
      mimeType: logo.type,
      size: logo.size,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      dataUrl,
    },
    status: 'pending_code_assignment',
    source: 'secondary-widget',
    createdAt: now,
    updatedAt: now,
  })

  await writeRequests(requests)

  redirect('/request-invitation/success')
}
