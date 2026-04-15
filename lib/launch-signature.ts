import 'server-only'

import crypto from 'crypto'
import { env } from '@/lib/env'

const SECRET = env.LAUNCH_SIGNATURE_SECRET

if (process.env.NODE_ENV === 'production') {
  if (SECRET.length < 32) {
    throw new Error(
      'LAUNCH_SIGNATURE_SECRET must be at least 32 characters long in production'
    )
  }

  if (SECRET === 'dev-secret-change-me') {
    throw new Error(
      'LAUNCH_SIGNATURE_SECRET cannot use a development default in production'
    )
  }
}

export function signLaunch(id: string): string {
  if (!id || id.trim().length === 0) {
    throw new Error('Cannot sign launch link: missing exhibitor id')
  }

  return crypto.createHmac('sha256', SECRET).update(id.trim()).digest('hex')
}

export function verifyLaunch(id: string, sig: string): boolean {
  if (!id || id.trim().length === 0) {
    return false
  }

  if (!sig || sig.trim().length === 0) {
    return false
  }

  const cleanId = id.trim()
  const cleanSig = sig.trim()
  const expected = signLaunch(cleanId)

  if (expected.length !== cleanSig.length) {
    return false
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(cleanSig, 'utf8')
    )
  } catch {
    return false
  }
}