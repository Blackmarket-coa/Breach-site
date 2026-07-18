import type { Config } from 'src/payload-types'

import { type DataFromGlobalSlug } from 'payload'
import { unstable_cache } from 'next/cache'
import { getPayloadClient, isBuildPhase, isConnectionError } from '@/utilities/getPayloadClient'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayloadClient()

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  unstable_cache(async () => getGlobal<T>(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })

/**
 * Build-safe global fetch for the shared layout (Header/Footer).
 *
 * `next build` renders the layout while prerendering static pages such as the
 * 404 page, which opens a Postgres connection. If the database is unreachable at
 * build time we return `null` so the build does not fail on a global fetch. The
 * failure is not cached (`unstable_cache` only stores successful results), so the
 * real global is fetched and cached on demand at runtime. Only connection-level
 * errors during the build phase are swallowed — at runtime, errors surface as
 * before (the retry wrapper in getPayloadClient already smooths transient blips),
 * so a transient failure is never cached as an empty global.
 */
export const getCachedGlobalSafe =
  <T extends Global>(slug: T, depth = 0) =>
  async (): Promise<DataFromGlobalSlug<T> | null> => {
    try {
      return await getCachedGlobal(slug, depth)()
    } catch (error) {
      if (isBuildPhase() && isConnectionError(error)) {
        const reason = error instanceof Error ? error.message : String(error)
        console.warn(
          `[build] global "${String(slug)}": database unreachable (${reason}). ` +
            `Rendering without it — the real value loads on demand at runtime.`,
        )
        return null
      }
      throw error
    }
  }
