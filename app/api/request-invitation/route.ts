import { promises as fs } from 'fs'
import path from 'path'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATA_DIR = path.join(process.cwd(), '.data')
const REQUESTS_FILE = path.join(DATA_DIR, 'public-invitation-requests.json')
const MAX_LOGO_BYTES = 3 * 1024 * 1024

type PublicInvitationRequest = {
  id: string
  companyName: string
  logo: {
    filename: string
    mimeType: string
    size: number
    dataUrl: string
  }
  status: 'pending_code_assignment'
  createdAt: string
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

export async function POST(request: Request) {
  const formData = await request.formData()

  const companyName = String(formData.get('companyName') || '').trim()
  const logo = formData.get('logo')

  if (!companyName || companyName.length < 2) {
    return new Response('Company name is required.', { status: 400 })
  }

  if (!(logo instanceof File)) {
    return new Response('Logo file is required.', { status: 400 })
  }

  if (!logo.type.startsWith('image/')) {
    return new Response('Logo must be an image.', { status: 400 })
  }

  if (logo.size > MAX_LOGO_BYTES) {
    return new Response('Logo is too large. Maximum size is 3MB.', { status: 400 })
  }

  const buffer = Buffer.from(await logo.arrayBuffer())
  const dataUrl = `data:${logo.type};base64,${buffer.toString('base64')}`

  const requests = await readRequests()

  requests.push({
    id: crypto.randomUUID(),
    companyName,
    logo: {
      filename: logo.name || 'logo',
      mimeType: logo.type,
      size: logo.size,
      dataUrl,
    },
    status: 'pending_code_assignment',
    createdAt: new Date().toISOString(),
  })

  await writeRequests(requests)

  redirect('/request-invitation/success')
}
