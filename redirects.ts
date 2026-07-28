import type { NextConfig } from 'next'

import { CANONICAL_DOMAIN, CANONICAL_SITE_URL } from './src/utilities/siteMetadata'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Serve the site from the apex domain only. Without this, www and apex are
  // two crawlable copies of every notice page — splitting search ranking and
  // handing people two different URLs for the same legal notice.
  const wwwRedirect = {
    destination: `${CANONICAL_SITE_URL}/:path*`,
    has: [
      {
        type: 'host' as const,
        value: `www.${CANONICAL_DOMAIN}`,
      },
    ],
    permanent: true,
    source: '/:path*',
  }

  return [wwwRedirect, internetExplorerRedirect]
}
