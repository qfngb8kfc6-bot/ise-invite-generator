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

async function hmacSha256(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(message)
  )

  return bytesToBase64Url(new Uint8Array(signature))
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

  const [payload, signature] = value.split('.')

  if (!payload || !signature) {
    return false
  }

  const expectedSignature = await hmacSha256(payload, secret)

  if (signature !== expectedSignature) {
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
