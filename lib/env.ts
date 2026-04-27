import 'server-only'

export type Env = {
  JWT_SECRET: string
  JWT_ISSUER: string
  JWT_AUDIENCE: string
  NEXT_PUBLIC_APP_URL: string
  LAUNCH_SIGNATURE_SECRET: string

  REPORTS_BASIC_AUTH_USERNAME: string
  REPORTS_BASIC_AUTH_PASSWORD: string

  ANALYTICS_DATABASE_URL: string

  EXHIBITOR_DATA_SOURCE: 'mys' | 'mock'
  ALLOW_MOCK_FALLBACK: boolean

  MYS_API_BASE_URL: string
  MYS_API_USERNAME: string
  MYS_API_PASSWORD: string
  MYS_SHOWCODE: string
  MYS_API_TIMEOUT_MS: string
  MYS_EVENT_ID: string

  EBO_API_BASE_URL: string
  EBO_API_KEY: string
  EBO_API_TIMEOUT_MS: string
  EBO_LAUNCH_SECRET: string
  EBO_REGISTRATION_BASE_URL: string
}

function getRequiredEnv(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value.trim()
}

function getOptionalEnv(name: keyof NodeJS.ProcessEnv): string {
  return process.env[name]?.trim() || ''
}

function getBooleanEnv(name: keyof NodeJS.ProcessEnv, defaultValue: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase()

  if (!raw) {
    return defaultValue
  }

  if (raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on') {
    return true
  }

  if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off') {
    return false
  }

  throw new Error(`${String(name)} must be a boolean-like value (true/false)`)
}

const exhibitorDataSource = (process.env.EXHIBITOR_DATA_SOURCE?.trim() ||
  'mock') as 'mys' | 'mock'

if (exhibitorDataSource !== 'mys' && exhibitorDataSource !== 'mock') {
  throw new Error('EXHIBITOR_DATA_SOURCE must be either "mys" or "mock"')
}

export const env: Env = {
  JWT_SECRET: getRequiredEnv('JWT_SECRET'),
  JWT_ISSUER: getRequiredEnv('JWT_ISSUER'),
  JWT_AUDIENCE: getRequiredEnv('JWT_AUDIENCE'),
  NEXT_PUBLIC_APP_URL: getRequiredEnv('NEXT_PUBLIC_APP_URL'),
  LAUNCH_SIGNATURE_SECRET: getRequiredEnv('LAUNCH_SIGNATURE_SECRET'),

  REPORTS_BASIC_AUTH_USERNAME: getRequiredEnv('REPORTS_BASIC_AUTH_USERNAME'),
  REPORTS_BASIC_AUTH_PASSWORD: getRequiredEnv('REPORTS_BASIC_AUTH_PASSWORD'),


  ANALYTICS_DATABASE_URL: getOptionalEnv('ANALYTICS_DATABASE_URL'),
  

  EXHIBITOR_DATA_SOURCE: exhibitorDataSource,
  ALLOW_MOCK_FALLBACK: getBooleanEnv('ALLOW_MOCK_FALLBACK', false),

  MYS_API_BASE_URL: getOptionalEnv('MYS_API_BASE_URL'),
  MYS_API_USERNAME: getOptionalEnv('MYS_API_USERNAME'),
  MYS_API_PASSWORD: getOptionalEnv('MYS_API_PASSWORD'),
  MYS_SHOWCODE: getOptionalEnv('MYS_SHOWCODE'),
  MYS_API_TIMEOUT_MS: getOptionalEnv('MYS_API_TIMEOUT_MS'),
  MYS_EVENT_ID: getOptionalEnv('MYS_EVENT_ID'),

  EBO_API_BASE_URL: getOptionalEnv('EBO_API_BASE_URL'),
  EBO_API_KEY: getOptionalEnv('EBO_API_KEY'),
  EBO_API_TIMEOUT_MS: getOptionalEnv('EBO_API_TIMEOUT_MS'),
  EBO_LAUNCH_SECRET: getOptionalEnv('EBO_LAUNCH_SECRET'),
  EBO_REGISTRATION_BASE_URL: getOptionalEnv('EBO_REGISTRATION_BASE_URL'),
}