import { execSync } from 'node:child_process'

/**
 * Run Payload database migrations before `next build`, but ONLY on Vercel
 * *production* deployments.
 *
 * Vercel exposes the same env vars (including `DATABASE_URL`) to Production and
 * Preview deployments, so migrating on every build would let a preview branch
 * mutate the production schema. Gating on `VERCEL_ENV === 'production'` means:
 *
 * - Production deploys apply committed migrations, then build.
 * - Preview deploys, local `pnpm build`, and CI all skip this step and keep
 *   their previous behavior (CI runs `pnpm migrate` in its own dedicated step
 *   against a throwaway database).
 *
 * If a migration fails, `execSync` throws and this script exits non-zero, which
 * aborts the build — you never deploy against a half-migrated schema.
 */
const vercelEnv = process.env.VERCEL_ENV

if (vercelEnv === 'production') {
  console.log('[build] Vercel production deploy — applying Payload migrations before build…')
  execSync('pnpm run migrate', { stdio: 'inherit' })
} else {
  console.log(
    `[build] Skipping Payload migrations (VERCEL_ENV=${vercelEnv ?? 'unset'}); ` +
      'they run only on Vercel production deploys.',
  )
}
