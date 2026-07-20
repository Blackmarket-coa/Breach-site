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
 * If a migration fails, this script exits non-zero, which aborts the build —
 * you never deploy against a half-migrated schema.
 *
 * Two robustness features for managed/pooled databases (e.g. Supabase):
 *
 * 1. Transient-connection retry. The migrate step needs a database connection,
 *    and a busy connection pooler can briefly refuse it ("max clients reached in
 *    session mode", EMAXCONNSESSION) while other clients hold the slots. Because
 *    the failure happens at CONNECT time — before any migration runs — retrying
 *    is safe and idempotent, and usually succeeds once a slot frees up.
 *
 * 2. Optional dedicated migration connection. Set MIGRATE_DATABASE_URL to run
 *    migrations against a different connection than the app runtime — e.g. run
 *    the app on the transaction pooler (port 6543, huge client capacity) while
 *    migrations use the session pooler or a direct connection (port 5432), which
 *    transaction mode can't do DDL on. This keeps the session pooler's limited
 *    slots free for migrations instead of competing with live site traffic.
 */
const vercelEnv = process.env.VERCEL_ENV

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runMigrations() {
  // Allow migrations to use a dedicated connection string (session/direct) even
  // when the app runtime uses a different one (e.g. the transaction pooler).
  const migrateEnv = { ...process.env }
  if (process.env.MIGRATE_DATABASE_URL) {
    migrateEnv.DATABASE_URL = process.env.MIGRATE_DATABASE_URL
    console.log('[build] Using MIGRATE_DATABASE_URL for the migration connection.')
  }

  const maxAttempts = Number(process.env.MIGRATE_MAX_ATTEMPTS) || 5
  const baseBackoffMs = Number(process.env.MIGRATE_BACKOFF_MS) || 5000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync('pnpm run migrate', { stdio: 'inherit', env: migrateEnv })
      return
    } catch (error) {
      // execSync inherits the child's stderr to the console, so the DB error
      // text isn't available on `error` to classify. Retry on any failure
      // except the last attempt — migrations are idempotent (Payload records
      // applied ones and wraps each in a transaction), so a retry either
      // connects and no-ops or re-applies safely. The common cause here is a
      // saturated connection pool that frees up within a few seconds.
      if (attempt >= maxAttempts) {
        throw error
      }

      const delay = Math.min(baseBackoffMs * 2 ** (attempt - 1), 60000)
      console.warn(
        `[build] Migration failed (attempt ${attempt}/${maxAttempts}). If the database ` +
          `connection pool is saturated ("max clients reached"), retrying in ` +
          `${Math.round(delay / 1000)}s should clear once a slot frees up. ` +
          'If this persists, raise the Supabase pooler Pool Size or set ' +
          'MIGRATE_DATABASE_URL to a direct/session connection.',
      )
      await sleep(delay)
    }
  }
}

if (vercelEnv === 'production') {
  console.log('[build] Vercel production deploy — applying Payload migrations before build…')
  await runMigrations()
} else {
  console.log(
    `[build] Skipping Payload migrations (VERCEL_ENV=${vercelEnv ?? 'unset'}); ` +
      'they run only on Vercel production deploys.',
  )
}
