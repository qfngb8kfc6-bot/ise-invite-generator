import 'server-only'

import { Pool } from 'pg'

type SqlTag = {
  <T = unknown[]>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T>
}

let pool: Pool | null = null
let tableEnsured = false

function getConnectionString(): string {
  return process.env.ANALYTICS_DATABASE_URL?.trim() || ''
}

function shouldUseSsl(connectionString: string): boolean {
  return (
    !connectionString.includes('localhost') &&
    !connectionString.includes('127.0.0.1')
  )
}

function getPool(): Pool {
  const connectionString = getConnectionString()

  if (!connectionString) {
    throw new Error('ANALYTICS_DATABASE_URL is not configured')
  }

  if (!pool) {
    const url = new URL(connectionString)

    pool = new Pool({
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      database: url.pathname.replace(/^\//, ''),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      max: 1,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
      ssl: shouldUseSsl(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    })
  }

  return pool
}

function buildQuery(
  strings: TemplateStringsArray,
  values: unknown[]
): { text: string; params: unknown[] } {
  let text = ''

  for (let i = 0; i < strings.length; i += 1) {
    text += strings[i]

    if (i < values.length) {
      text += `$${i + 1}`
    }
  }

  return {
    text,
    params: values,
  }
}

function createSqlTag(): SqlTag {
  return async function sql<T = unknown[]>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T> {
    const { text, params } = buildQuery(strings, values)
    const result = await getPool().query(text, params)
    return result.rows as T
  }
}

const sqlTag = createSqlTag()

export function isAnalyticsDbEnabled(): boolean {
  return Boolean(getConnectionString())
}

export function getAnalyticsDb(): SqlTag | null {
  if (!isAnalyticsDbEnabled()) {
    return null
  }

  return sqlTag
}

export async function ensureAnalyticsTable(): Promise<void> {
  if (!isAnalyticsDbEnabled()) {
    return
  }

  if (tableEnsured) {
    return
  }

  const db = getPool()

  await db.query(`
    create table if not exists analytics_events (
      id text primary key,
      exhibitor_id text not null,
      company_name text not null,
      event_type text not null,
      format text null,
      timestamp timestamptz not null,
      environment text not null,
      metadata jsonb not null default '{}'::jsonb
    )
  `)

  await db.query(`
    create index if not exists analytics_events_exhibitor_id_idx
    on analytics_events (exhibitor_id)
  `)

  await db.query(`
    create index if not exists analytics_events_timestamp_idx
    on analytics_events (timestamp desc)
  `)

  await db.query(`
    create index if not exists analytics_events_event_type_idx
    on analytics_events (event_type)
  `)

  tableEnsured = true
}