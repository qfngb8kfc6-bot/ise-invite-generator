import 'server-only'

import { jwtVerify, SignJWT } from 'jose'
import { env } from '@/lib/env'

const encoder = new TextEncoder()

const JWT_SECRET = env.JWT_SECRET
const JWT_ISSUER = env.JWT_ISSUER
const JWT_AUDIENCE = env.JWT_AUDIENCE

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}

const secret = encoder.encode(JWT_SECRET)

export type SessionTokenPayload = {
  exhibitorId: string
}

export async function signExhibitorToken(exhibitorId: string): Promise<string> {
  if (!exhibitorId || exhibitorId.trim().length === 0) {
    throw new Error('Cannot sign token: exhibitorId is missing')
  }

  return await new SignJWT({ exhibitorId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setSubject(exhibitorId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export async function verifyExhibitorToken(
  token: string
): Promise<SessionTokenPayload> {
  if (!token || token.trim().length === 0) {
    throw new Error('Missing token')
  }

  const { payload } = await jwtVerify(token, secret, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  })

  const exhibitorId = payload.exhibitorId

  if (typeof exhibitorId !== 'string' || exhibitorId.trim().length === 0) {
    throw new Error('Token missing exhibitorId')
  }

  return {
    exhibitorId: exhibitorId.trim(),
  }
}