import 'server-only'

import crypto from 'crypto'

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOptionalEnv(name: string): string {
  return process.env[name]?.trim() || ''
}

function getSecret(): string {
  return getRequiredEnv('LAUNCH_SIGNATURE_SECRET')
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
  const base = getOptionalEnv('EBO_REGISTRATION_BASE_URL')

  if (!base) {
    return ''
  }

  const joiner = base.includes('?') ? '&' : '?'
  return `${base}${joiner}code=${encodeURIComponent(invitationCode)}`
}
