import { isConnectionError } from './getPayloadClient'

/**
 * Runs a route's `generateStaticParams` body, degrading gracefully when the
 * database cannot be reached during `next build`.
 *
 * `next build` prerenders the frontend routes, and the first thing it does when
 * collecting page data for a dynamic segment is call `generateStaticParams`,
 * which opens a Postgres connection. Against a cold managed database/pooler
 * (e.g. Supabase) that first connection can time out even after the bounded
 * retries in `getPayloadClient`, and a single throw here aborts the *entire*
 * build ("Failed to collect page data for …").
 *
 * When the failure is a connection-level error we log a clear warning and return
 * an empty param list instead of throwing. With `dynamicParams = true` (the
 * default), the affected pages are then generated on demand at first request —
 * by which point the pool is warm — so no content is lost and the build no
 * longer depends on the database being reachable at build time. The retry
 * attempts also warm the pooler, so the subsequent render phase usually
 * connects cleanly.
 *
 * Non-connection errors (bad queries, config problems) still surface
 * immediately, since those are genuine build failures.
 */
export async function generateStaticParamsSafe<T>(
  routeLabel: string,
  fn: () => Promise<T[]>,
): Promise<T[]> {
  try {
    return await fn()
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    const reason = error instanceof Error ? error.message : String(error)
    console.warn(
      `[build] ${routeLabel}: database unreachable during generateStaticParams ` +
        `(${reason}). Skipping build-time prerendering — these pages will be ` +
        `generated on demand at first request.`,
    )
    return []
  }
}
