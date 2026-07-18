import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

/**
 * Returns an initialized Payload instance, retrying transient database
 * connection failures with exponential backoff.
 *
 * `next build` statically generates pages by querying Payload, so every page
 * opens a Postgres connection at build time. Against a managed/pooled database
 * (e.g. Supabase's connection pooler), the first connection from a cold build
 * worker can fail with `ETIMEDOUT`/`ECONNRESET` while the instance or pooler
 * warms up or a transient network blip clears. A single failure aborts the whole
 * build ("Failed to collect page data for ..."). Payload clears its cached init
 * promise when init rejects, so re-calling `getPayload` genuinely re-attempts the
 * connection — by which point the pool is usually warm. Bounded retry with
 * backoff turns those flaky timeouts into a successful build without abandoning
 * static generation. At runtime it likewise smooths over serverless cold starts.
 *
 * Only connection-level errors are retried; a genuinely unreachable database
 * still fails (after the configured attempts) with its original error, and query
 * errors surface immediately.
 *
 * Tunable via env:
 * - `PAYLOAD_DB_CONNECT_RETRIES` — total attempts (default 4)
 * - `PAYLOAD_DB_CONNECT_BACKOFF_MS` — base backoff, doubled each retry (default 1000)
 */

// Connection-level failures worth retrying. Payload wraps the underlying driver
// error, so we match both error codes (anywhere in the `cause` chain) and the
// message text it surfaces (e.g. "cannot connect to Postgres", pg's pool
// "timeout expired").
const RETRYABLE_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'EAI_AGAIN',
])

const RETRYABLE_MESSAGES = [
  'cannot connect to postgres',
  'timeout expired',
  'connection terminated',
  'terminating connection',
  'connection timeout',
  'etimedout',
  'econnreset',
  'econnrefused',
]

const isRetryable = (error: unknown, depth = 0): boolean => {
  if (!error || typeof error !== 'object' || depth > 8) return false

  const code = (error as { code?: unknown }).code
  if (typeof code === 'string' && RETRYABLE_CODES.has(code)) return true

  const message = (error as { message?: unknown }).message
  if (typeof message === 'string') {
    const lower = message.toLowerCase()
    if (RETRYABLE_MESSAGES.some((needle) => lower.includes(needle))) return true
  }

  // Walk wrapped/aggregate errors (Payload wraps the driver error; pg may nest).
  const cause = (error as { cause?: unknown }).cause
  if (cause && cause !== error && isRetryable(cause, depth + 1)) return true

  const aggregated = (error as { errors?: unknown }).errors
  if (Array.isArray(aggregated)) {
    return aggregated.some((nested) => isRetryable(nested, depth + 1))
  }

  return false
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const positiveIntFromEnv = (name: string, fallback: number): number => {
  const parsed = Number(process.env[name])
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

export const getPayloadClient = async (): Promise<Payload> => {
  const maxAttempts = positiveIntFromEnv('PAYLOAD_DB_CONNECT_RETRIES', 4)
  const baseBackoffMs = positiveIntFromEnv('PAYLOAD_DB_CONNECT_BACKOFF_MS', 1000)

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await getPayload({ config: configPromise })
    } catch (error) {
      lastError = error

      if (attempt >= maxAttempts || !isRetryable(error)) {
        throw error
      }

      const delay = Math.min(baseBackoffMs * 2 ** (attempt - 1), 15000)
      const reason = error instanceof Error ? error.message : String(error)
      console.warn(
        `[payload] database connection attempt ${attempt}/${maxAttempts} failed: ` +
          `${reason}. Retrying in ${delay}ms…`,
      )
      await sleep(delay)
    }
  }

  throw lastError
}
