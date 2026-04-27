import 'server-only'

import { Pool } from 'pg'
import { env } from './env'

type SqlTag = {
  <T = unknown[]>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T>
}

let pool: Pool | null = null
let tableEnsured = false

function getConnectionString(): string {
  return env.ANALYTICS_DATABASE_URL
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
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
  return false
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

  await getPool().query(`
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

  await getPool().query(`
    create index if not exists analytics_events_exhibitor_id_idx
    on analytics_events (exhibitor_id)
  `)

  await getPool().query(`
    create index if not exists analytics_events_timestamp_idx
    on analytics_events (timestamp desc)
  `)

  await getPool().query(`
    create index if not exists analytics_events_event_type_idx
    on analytics_events (event_type)
  `)

  tableEnsured = true
}