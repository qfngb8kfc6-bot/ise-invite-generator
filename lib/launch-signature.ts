import 'server-only'

import crypto from 'crypto'
import { env } from '@/lib/env'

function getSecret(): string {
  return env.LAUNCH_SIGNATURE_SECRET
}

export function signLaunch(exhibitorId: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(exhibitorId)
    .digest('hex')
}

export function verifyLaunch(exhibitorId: string, signature: string): boolean {
  const expected = signLaunch(exhibitorId)

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

export function verifyLaunchSignature(
  exhibitorId: string,
  signature: string
): boolean {
  return verifyLaunch(exhibitorId, signature)
}

export function buildRegistrationUrl(invitationCode: string): string {
  const base = env.EBO_REGISTRATION_BASE_URL?.trim() || ''

  if (!base) {
    return ''
  }

  const joiner = base.includes('?') ? '&' : '?'
  return `${base}${joiner}code=${encodeURIComponent(invitationCode)}`
}