import PageTemplate, { generateMetadata } from './[slug]/page'

// Render the home page on demand instead of prerendering it at build time. The
// home content is queried from Payload (Postgres), so prerendering here would
// make `next build` depend on the database being reachable from the build
// environment. Rendering on demand keeps the build database-independent; the
// page is served (and cached by the CDN) at request time.
export const dynamic = 'force-dynamic'

export default PageTemplate

export { generateMetadata }
