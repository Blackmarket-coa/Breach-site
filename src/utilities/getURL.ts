import canUseDOM from './canUseDOM'
import { CANONICAL_SITE_URL } from './siteMetadata'

/**
 * Origin used when neither NEXT_PUBLIC_SERVER_URL nor a Vercel-provided
 * production URL is available. Local development keeps localhost; every other
 * environment resolves to the canonical domain, so a missing environment
 * variable can never bake `http://localhost:3000` into sitemaps, OpenGraph
 * image URLs or emailed links.
 */
const fallbackURL = () =>
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : CANONICAL_SITE_URL

export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : fallbackURL())
  )
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return fallbackURL()
}
