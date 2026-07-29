// Mirrors CANONICAL_DOMAIN in src/utilities/siteMetadata.ts — this file is
// CommonJS, loaded by the next-sitemap CLI outside the Next.js/TS pipeline, so
// it cannot import from there. Update both together.
const CANONICAL_SITE_URL = 'https://breachnoticevaloanlady.com'

// VERCEL_PROJECT_PRODUCTION_URL is a bare hostname, so it needs the scheme
// added — without it robots.txt and the sitemap index emit protocol-less URLs.
const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : CANONICAL_SITE_URL)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/*', '/updates/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
