# Deployment Runbook

End-to-end guide for taking this portal from repository to production behind Cloudflare. Follow the sections in order for a first deployment; each is independent afterwards.

**Architecture:**

```
            Internet
               │
   Cloudflare DNS + CDN + WAF        (proxied "orange cloud", Turnstile, rate limits)
               │
   Docker host (e.g. Fly.io)         (Next.js + Payload, one container)
               │
   Supabase Postgres                 (managed database + backups)
   Supabase Storage (S3)             (optional: uploaded media/PDFs)
   Resend                            (transactional email)
```

---

## 1. Supabase (database)

1. Create a project at [supabase.com](https://supabase.com). Choose a strong database password and a region near your users.
2. Get the connection string: **Project Settings → Database → Connection string**. Use the **session-mode pooler** URI (port **5432**):

   ```
   postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
   ```

   Do **not** use the transaction-mode pooler (port 6543) — it breaks schema migrations (DDL) and long-lived connection assumptions.

   > **Build fails with `cannot connect to Postgres … ETIMEDOUT`?** `next build`
   > statically generates pages by querying the database, so it must be
   > reachable from the build environment. The build retries transient
   > connection failures with backoff (a cold Supabase instance/pooler often
   > times out on the first attempt then succeeds), tunable via
   > `PAYLOAD_DB_CONNECT_RETRIES` / `PAYLOAD_DB_CONNECT_TIMEOUT_MS`.
   >
   > `generateStaticParams` degrades gracefully: if the database is still
   > unreachable after those retries, the affected routes (`/[slug]`,
   > `/updates/[slug]`, `/updates/page/[pageNumber]`) log a `[build] … database
   > unreachable …` warning and skip build-time prerendering instead of aborting
   > the whole build, and are generated on demand at first request. Those retry
   > attempts also warm a cold pooler so the render phase usually connects. The
   > **home page and archive index still render at build time**, so a genuinely
   > unreachable database will still fail the build there — usually the wrong
   > `DATABASE_URL`: use the **session-mode pooler** hostname above
   > (`...pooler.supabase.com:5432`, IPv4-reachable), **not** the direct
   > `db.<project-ref>.supabase.co` endpoint, which is IPv6-only and times out
   > from IPv4-only build environments (e.g. Vercel).

3. **Required security step — disable the Data API for Payload's tables.** Supabase exposes the `public` schema through its auto-generated REST API (PostgREST) with the `anon` key. Payload owns its schema and does not use row-level security, so leaving this on would let anyone with the anon key read Payload's tables (including users and form submissions).

   Go to **Project Settings → API → Exposed schemas** and **remove `public`** from the list (this app never uses `supabase-js` or the Data API, so nothing breaks). Alternatively, enable RLS with no policies on every Payload table after each migration — removing the exposure is simpler and doesn't need repeating.

4. Never place the `service_role` key in this app's environment — it is not needed. Only `DATABASE_URL` is used.
5. Backups: the daily automatic backups on the free tier are kept for 7 days. Before launch, decide whether to enable Point-in-Time Recovery (paid) and periodically download a manual backup (**Database → Backups**). Test a restore once before go-live.

### Migrations

- Production schema changes happen **only** via committed migrations: `pnpm migrate:create <name>` locally, commit `src/migrations/`, then `pnpm migrate` runs in CI/the release step.
- Local dev uses push mode against a throwaway local Postgres. **Never point `pnpm dev` at the Supabase database** — push mode and migrations must not mix.
- **On Vercel**, committed migrations are applied automatically as the first step of the build, but **only on Production deployments** (`scripts/predeploy-migrate.mjs`, gated on `VERCEL_ENV === 'production'`). Preview deploys, local `pnpm build`, and CI skip it — so a preview branch never mutates the production schema, and CI still migrates its own throwaway database in a separate step. A failed migration aborts the deploy. On a Docker/Fly host, run migrations via the release step instead (see §2).

## 2. Hosting (Docker behind Cloudflare)

Any Docker host works; [Fly.io](https://fly.io) is the concrete example. (Alternative: deploy to Vercel with Cloudflare as DNS-only — but then Cloudflare WAF/rate-limiting does not sit in front, so prefer the proxied Docker setup.)

> **Deploying to Vercel instead:** before the first deploy, add every variable from the [environment variable reference](#environment-variable-reference) in **Project Settings → Environment Variables** (Production scope). Vercel exposes the same variables to build and runtime, so one set covers both — but they must exist **before** you trigger a build. If a build fails with `missing secret key. A secret key is needed to secure Payload` (or the preflight error naming `PAYLOAD_SECRET` / `DATABASE_URL`), the variables are missing from the Vercel project — add them and redeploy.

1. Install `flyctl`, then from the repo root:

   ```bash
   fly launch --no-deploy        # creates fly.toml, pick a region
   ```

2. In `fly.toml`, run migrations before each release and keep one always-on machine:

   ```toml
   [deploy]
     release_command = "npx payload migrate"

   [http_service]
     internal_port = 3000
     auto_stop_machines = false
     min_machines_running = 1
   ```

3. Set runtime secrets:

   ```bash
   fly secrets set \
     DATABASE_URL='postgresql://...' \
     PAYLOAD_SECRET="$(openssl rand -hex 32)" \
     CRON_SECRET="$(openssl rand -hex 24)" \
     PREVIEW_SECRET="$(openssl rand -hex 24)" \
     NEXT_PUBLIC_SERVER_URL='https://your-domain.example' \
     NEXT_PUBLIC_TURNSTILE_SITE_KEY='...' \
     TURNSTILE_SECRET_KEY='...' \
     RESEND_API_KEY='...' \
     EMAIL_FROM_ADDRESS='notifications@your-domain.example' \
     EMAIL_FROM_NAME='Incident Response Team' \
     ADMIN_NOTIFICATION_EMAIL='you@your-domain.example'
   ```

4. The build stage needs database access (Next.js statically generates pages from Payload). Pass build args on deploy:

   ```bash
   fly deploy \
     --build-arg DATABASE_URL='postgresql://...' \
     --build-arg PAYLOAD_SECRET='<same as secret>' \
     --build-arg NEXT_PUBLIC_SERVER_URL='https://your-domain.example' \
     --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY='...'
   ```

5. **Media persistence:** serverless/container filesystems are ephemeral, and uploads default to `public/media` on disk. `@payloadcms/storage-s3` is already wired in (`src/plugins`) and activates automatically when the five `S3_*` variables below are set — otherwise media falls back to local disk (fine for local dev, not for Vercel/Fly). Configure Supabase Storage:
   - In Supabase: **Storage → Create bucket** (e.g. `media`; it can stay **private** — files are served through Payload, not the bucket's public URL), then **Storage → S3 Connection / Settings → S3 access keys → New access key**.
   - Set `S3_BUCKET`, `S3_REGION` (the project's region, e.g. `us-east-1`), `S3_ENDPOINT` (`https://<project-ref>.supabase.co/storage/v1/s3`), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. On Vercel add them to the project env and redeploy.
   - Alternatives: the same `S3_*` variables point at any S3-compatible store (Cloudflare R2, AWS S3); on Fly you can instead mount a volume at the media path (`fly volumes create`).

## 3. Cloudflare (domain, HTTPS, WAF, Turnstile)

1. Buy/transfer the domain, add the site to Cloudflare, and point the domain's nameservers at Cloudflare.
2. **DNS:** create a `CNAME` (or `A`) record for the apex/`www` pointing at the host (e.g. `your-app.fly.dev`), with proxy status **Proxied** (orange cloud).
3. **SSL/TLS:** set encryption mode to **Full (strict)**. Enable **Always Use HTTPS**. (The app also sends HSTS; you can additionally enable HSTS at the edge under SSL/TLS → Edge Certificates.)
4. **DNSSEC:** enable it under DNS → Settings.
5. **WAF:** enable the free managed ruleset (Security → WAF) and Bot Fight Mode (Security → Bots).
6. **Rate-limiting rules** (Security → WAF → Rate limiting rules) as the production-grade layer in front of the app's own middleware:
   - `POST /api/form-submissions` — e.g. 5 requests per 10 minutes per IP → block.
   - `POST /api/users/login` — e.g. 10 requests per 15 minutes per IP → block.
7. **Turnstile:** Cloudflare dashboard → Turnstile → Add widget for your domain (Managed mode). Copy the **site key** into `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build arg + secret) and the **secret key** into `TURNSTILE_SECRET_KEY`, then redeploy. Until these are set, the form renders without the widget and the server skips verification (with a logged warning) — do not run production that way.

## 4. Email (Resend)

1. Create a [Resend](https://resend.com) account and add your sending domain.
2. Add the DNS records Resend provides (SPF, DKIM, and a DMARC TXT record) in Cloudflare DNS. Wait for verification.
3. Create an API key → `RESEND_API_KEY`. Set `EMAIL_FROM_ADDRESS` to an address on the verified domain (e.g. `notifications@your-domain.example`) and `ADMIN_NOTIFICATION_EMAIL` to wherever contact-form notifications should go.
4. Note: the dedicated public-facing incident inbox (the address posted on the site) is separate — create it with your mail provider and update the Contact/Notice pages in the admin panel.

## 5. Go-live checklist

| Step | How |
| --- | --- |
| First admin account | Visit `https://your-domain/admin` once — Payload prompts to create the first user. Use a strong unique password + a password manager. |
| Seed initial content | Log into the admin, then `POST https://your-domain/next/seed` with your session (e.g. from the browser console: `fetch('/next/seed', { method: 'POST' })`). |
| Replace ALL placeholders | Every `[BRACKETED]` passage in the seeded pages is placeholder text — replace with your reviewed statement (coordinate with the investigating agency) before announcing the site. |
| Post the real contact channels | Update the phone number/email placeholders on the Contact page and Security Notice once the dedicated line and inbox exist. |
| Upload the official notice PDF | Admin → Media (PDFs are allowed), then link it from the Security Notice page. |
| Verify security headers | `curl -I https://your-domain/` — expect CSP, HSTS, nosniff, referrer-policy. `curl -I https://your-domain/admin` — expect `X-Robots-Tag: noindex`. |
| Verify the form | Submit the contact form; confirm the Turnstile widget renders, the submission appears in Admin → Form Submissions, and the notification email arrives. |
| Uptime monitoring | Point a free monitor (e.g. UptimeRobot, or Fly checks) at `https://your-domain/`. Cloudflare Analytics covers traffic anomalies. |
| Backups sanity | Confirm Supabase backups are running; export one manually and store it safely. |

### Environment variable reference

| Variable | Purpose | Build-time? |
| --- | --- | --- |
| `DATABASE_URL` | Supabase session-pooler Postgres URI | yes (static generation) |
| `PAYLOAD_SECRET` | JWT/session encryption; rotating logs everyone out | yes |
| `NEXT_PUBLIC_SERVER_URL` | Canonical site URL (no trailing slash) | yes |
| `CRON_SECRET` | Auth for scheduled-job endpoint | no |
| `PREVIEW_SECRET` | Auth for draft preview links | no |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget (public) | yes (inlined) |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile verification | no |
| `RESEND_API_KEY` | Email sending (unset = log to console) | no |
| `EMAIL_FROM_ADDRESS` / `EMAIL_FROM_NAME` | From identity on notifications | no |
| `ADMIN_NOTIFICATION_EMAIL` | Recipient of contact-form notifications (used at seed time) | no |
| `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Media storage (Supabase Storage S3). All five together enable off-disk uploads; unset = local disk | no |

## 6. Operational notes

- **Admin access:** accounts are invite-only (created by an existing admin). Sessions expire after 2 hours; 5 failed logins lock an account for 10 minutes. Auth events and form submissions are recorded in Admin → Audit Logs.
- **Do not** put sensitive investigation material in Media — everything in Media is publicly readable by design (it backs the public site).
- **Adding another state's page** (e.g. Tennessee): Admin → Pages → duplicate the Security Incident Notice page, adjust the statute references and agency table, publish, and add it to the header nav (Globals → Header).
- **Separate crypto-fraud contact:** when the investigator confirms the approach, update the placeholder sections on the Home, Notice, FAQ, and Contact pages — no code changes needed.
