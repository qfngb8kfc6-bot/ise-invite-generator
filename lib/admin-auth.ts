import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE_NAME = 'ise_admin_session'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function getAdminUsername() {
  return (
    process.env.ADMIN_LOGIN_USERNAME?.trim() ||
    process.env.REPORTS_BASIC_AUTH_USERNAME?.trim() ||
    ''
  )
}

function getAdminPassword() {
  return (
    process.env.ADMIN_LOGIN_PASSWORD?.trim() ||
    process.env.REPORTS_BASIC_AUTH_PASSWORD?.trim() ||
    ''
  )
}

function getAdminSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    ''
  )
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function base64UrlToBytes(input: string) {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  const base64 = padded.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function base64UrlEncodeText(input: string) {
  return bytesToBase64Url(textEncoder.encode(input))
}

function base64UrlDecodeText(input: string) {
  return textDecoder.decode(base64UrlToBytes(input))
}

async function getHmacKey(secret: string, usage: 'sign' | 'verify') {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  )
}

async function hmacSha256(message: string, secret: string) {
  const key = await getHmacKey(secret, 'sign')

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(message)
  )

  return bytesToBase64Url(new Uint8Array(signature))
}

/**
 * Constant-time signature check: crypto.subtle.verify compares the HMAC
 * without leaking how many leading bytes matched (a plain !== can).
 */
async function verifyHmacSha256(message: string, signature: string, secret: string) {
  let signatureBytes: Uint8Array

  try {
    signatureBytes = base64UrlToBytes(signature)
  } catch {
    return false
  }

  const key = await getHmacKey(secret, 'verify')

  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes as BufferSource,
    textEncoder.encode(message)
  )
}

/**
 * Constant-time string comparison for credentials. Both sides are hashed
 * first so the comparison length is fixed (no length leak either).
 */
async function constantTimeEqual(a: string, b: string) {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', textEncoder.encode(a)),
    crypto.subtle.digest('SHA-256', textEncoder.encode(b)),
  ])
  const bytesA = new Uint8Array(hashA)
  const bytesB = new Uint8Array(hashB)
  let diff = 0

  for (let index = 0; index < bytesA.length; index += 1) {
    diff |= bytesA[index] ^ bytesB[index]
  }

  return diff === 0
}

/** Checks a login attempt against the configured admin username/password. */
export async function checkAdminCredentials(username: string, password: string) {
  const expectedUsername = getAdminUsername()
  const expectedPassword = getAdminPassword()

  if (!expectedUsername || !expectedPassword) {
    return false
  }

  // Evaluate both, always, so timing doesn't reveal which one was wrong.
  const [usernameOk, passwordOk] = await Promise.all([
    constantTimeEqual(username, expectedUsername),
    constantTimeEqual(password, expectedPassword),
  ])

  return usernameOk && passwordOk
}

/**
 * Where to send someone after signing in. Only same-site admin paths are
 * allowed (/reports, /admin, /tools); anything else, including absolute
 * URLs, protocol-relative "//evil.com" and backslash tricks, falls back to
 * /reports. Prevents ?redirect= being used as an open redirect.
 */
export function safeRedirectTarget(value: string | null | undefined): string {
  const fallback = '/reports'

  if (!value) return fallback

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback
  }

  if (!/^\/(reports|admin|tools)(\/|\?|$)/.test(trimmed)) return fallback
  if (trimmed.startsWith('/admin/login')) return fallback

  return trimmed
}

export function getAdminCredentials() {
  return {
    username: getAdminUsername(),
    password: getAdminPassword(),
    secret: getAdminSecret(),
  }
}

export async function createAdminSessionCookieValue(username: string) {
  const secret = getAdminSecret()

  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET or JWT_SECRET')
  }

  const payload = base64UrlEncodeText(
    JSON.stringify({
      username,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 8,
    })
  )

  const signature = await hmacSha256(payload, secret)

  return `${payload}.${signature}`
}

export async function verifyAdminSessionCookieValue(value?: string) {
  const secret = getAdminSecret()

  if (!value || !secret || !value.includes('.')) {
    return false
  }

  const parts = value.split('.')
  const [payload, signature] = parts

  if (parts.length !== 2 || !payload || !signature) {
    return false
  }

  if (!(await verifyHmacSha256(payload, signature, secret))) {
    return false
  }

  try {
    const decoded = JSON.parse(base64UrlDecodeText(payload)) as {
      username?: string
      exp?: number
    }

    if (!decoded.username || !decoded.exp) {
      return false
    }

    if (Date.now() > decoded.exp) {
      return false
    }

    return decoded.username === getAdminUsername()
  } catch {
    return false
  }
}

export async function isAdminRequest(request: NextRequest) {
  return verifyAdminSessionCookieValue(request.cookies.get(ADMIN_COOKIE_NAME)?.value)
}
