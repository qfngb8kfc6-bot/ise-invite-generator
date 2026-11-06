
/**
 * Failed-login rate limit, held in memory per server instance. On Vercel each
 * warm function instance keeps its own counters, so this slows brute force
 * down rather than giving a hard global cap; a shared store (e.g. Upstash
 * Redis) would be needed for that.
 *
 * - Per IP: 5 failed attempts per 15 minutes, then locked until the window
 *   that started with the first failure has passed.
 * - Global safety net: 50 failed attempts per 15 minutes across all IPs, in
 *   case the client IP header can be spoofed (e.g. no proxy in front).
 * - A successful login clears that IP's counter.
 */

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES_PER_IP = 5
const MAX_FAILURES_GLOBAL = 50

type Bucket = { failures: number; windowStart: number }

const byIp = new Map<string, Bucket>()
let global: Bucket = { failures: 0, windowStart: 0 }

function current(bucket: Bucket | undefined, now: number): Bucket {
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) return { failures: 0, windowStart: now }
  return bucket
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Returns seconds until retry is allowed, or 0 if the attempt may proceed. */
export function loginBlockedFor(ip: string, now = Date.now()): number {
  const ipBucket = current(byIp.get(ip), now)
  global = current(global, now)

  const ipWait = ipBucket.failures >= MAX_FAILURES_PER_IP ? ipBucket.windowStart + WINDOW_MS - now : 0
  const globalWait = global.failures >= MAX_FAILURES_GLOBAL ? global.windowStart + WINDOW_MS - now : 0

  return Math.ceil(Math.max(ipWait, globalWait, 0) / 1000)
}

export function recordLoginFailure(ip: string, now = Date.now()): void {
  const ipBucket = current(byIp.get(ip), now)
  ipBucket.failures += 1
  byIp.set(ip, ipBucket)

  global = current(global, now)
  global.failures += 1

  // Keep the map small: drop expired entries occasionally.
  if (byIp.size > 5000) {
    for (const [key, bucket] of byIp) if (now - bucket.windowStart >= WINDOW_MS) byIp.delete(key)
  }
}

export function recordLoginSuccess(ip: string): void {
  byIp.delete(ip)
}

export const LOGIN_RATE_LIMIT = { WINDOW_MS, MAX_FAILURES_PER_IP, MAX_FAILURES_GLOBAL }
