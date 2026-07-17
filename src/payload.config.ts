import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { AuditLogs } from './collections/AuditLogs'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) {
  throw new Error(
    'PAYLOAD_SECRET is not set. Payload needs it to sign auth tokens. ' +
      'Generate one with `openssl rand -hex 32` and set it in the environment ' +
      'for both build and runtime (locally: .env; on your host: e.g. Vercel ' +
      'Project Settings → Environment Variables, or Fly build args + secrets). ' +
      'See DEPLOYMENT.md → "Environment variable reference".',
  )
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. `next build` statically generates pages by querying ' +
      'Payload, so the database must be reachable at build time as well as runtime. ' +
      'See DEPLOYMENT.md → "Environment variable reference".',
  )
}

export default buildConfig({
  admin: {
    // Local default avatars — gravatar.com would violate the CSP img-src policy
    avatar: 'default',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  collections: [Pages, Posts, Media, Categories, Users, AuditLogs],
  cors: [getServerSideURL()].filter(Boolean),
  // Without RESEND_API_KEY, Payload logs emails to the console (local dev)
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'notifications@example.com',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Incident Response Portal',
      })
    : undefined,
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
