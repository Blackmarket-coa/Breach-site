// Single source of truth for the public site's name, description and domain.
// Referenced by page metadata, OpenGraph/social cards, the SEO plugin, and
// the search page so these never drift apart.
export const SITE_NAME = 'Incident Response Portal'
export const SITE_DESCRIPTION =
  'Public data breach notification and consumer resource portal.'

/**
 * Canonical public domain for the portal, without protocol or `www.`.
 *
 * Deployments should still set `NEXT_PUBLIC_SERVER_URL` explicitly — this is
 * the fallback that keeps absolute URLs (OpenGraph images, sitemaps,
 * `metadataBase`, notification "From" addresses) pointing somewhere real when
 * that variable is missing, instead of emitting `localhost` or a placeholder
 * host into production output.
 *
 * `next-sitemap.config.cjs` mirrors this value: it is CommonJS and loaded by
 * the next-sitemap CLI outside the Next.js/TS pipeline, so it cannot import
 * from here. Update both together.
 */
export const CANONICAL_DOMAIN = 'breachnoticevaloanlady.com'

/** Canonical site origin, no trailing slash. */
export const CANONICAL_SITE_URL = `https://${CANONICAL_DOMAIN}`
