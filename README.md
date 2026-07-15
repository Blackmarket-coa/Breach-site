# Breach Incident Response Portal

A public incident response portal for communicating about a data security incident: the official security notice, ongoing investigation updates, FAQ, identity-theft/consumer-protection resources, and a secure contact channel for affected individuals.

Website owner and operator: **Arielle Cadet-King**.

Built with [Payload CMS](https://payloadcms.com) 3.x on Next.js, backed by Postgres (Supabase in production), and designed to sit behind Cloudflare (DNS, CDN, WAF, Turnstile).

Based on the official Payload Website Template (v3.86.0).

## Pages

| Route                       | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `/`                         | Home — incident summary and quick links                          |
| `/security-incident-notice` | The official security incident notice (with downloadable PDF)    |
| `/updates`                  | Investigation updates (chronological, with drafts + scheduling)  |
| `/faq`                      | Frequently asked questions                                       |
| `/resources`                | Identity theft & consumer protection resources                   |
| `/contact`                  | Secure contact form (Turnstile-protected, rate-limited)          |
| `/admin`                    | Admin panel (invite-only, noindexed)                             |

## Quick start (local)

Requirements: Node 20+ (or 18.20+), pnpm 9+, Docker (for local Postgres).

```bash
cp .env.example .env          # fill in PAYLOAD_SECRET at minimum
docker compose up -d          # local Postgres on :5432
pnpm install
pnpm dev                      # http://localhost:3000
```

Then:

1. Open `http://localhost:3000/admin` and create the first admin user.
2. Seed placeholder content: log in, then `POST /next/seed` (authenticated), or use the seed link if enabled.
3. Edit pages, updates, and the contact form in the admin panel.

In local dev the Postgres adapter runs in `push` mode (schema is synced automatically, no migrations needed). Production databases are only ever changed via committed migrations — see below.

## Database migrations

```bash
pnpm migrate:create <name>   # generate a migration after schema changes
pnpm migrate                 # apply migrations (run in CI/production release step)
```

Never point local dev (push mode) at the production/Supabase database.

## Environment variables

See [.env.example](./.env.example) for the full annotated list. Highlights:

- `DATABASE_URL` — Postgres connection string. For Supabase use the **session-mode pooler** (port 5432).
- `PAYLOAD_SECRET` — JWT encryption secret.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile bot protection on the contact form.
- `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `ADMIN_NOTIFICATION_EMAIL` — email notifications for contact submissions.

## Security posture

- Contact form: Cloudflare Turnstile verification (server-side), input size caps, per-IP rate limiting, email notification to administrators.
- Admin: no public registration, login lockout after repeated failures, 2h session expiration, secure cookies in production, audit logging of auth events and submissions, `noindex` on `/admin`.
- HTTP: Content-Security-Policy, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` headers set in `next.config.ts`.
- Production edge: Cloudflare WAF, rate-limiting rules, and Bot Fight Mode (see the deployment runbook).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full runbook: Supabase setup (including the required PostgREST exposure fix), Docker hosting behind the Cloudflare proxy, Turnstile and Resend configuration, DNS/email records, backups, and the go-live checklist.

## Scripts

| Script                 | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `pnpm dev`             | Dev server                                 |
| `pnpm build`           | Production build (+ sitemap)               |
| `pnpm start`           | Serve the production build                 |
| `pnpm dev:prod`        | Clean build + serve, to test a prod build locally |
| `pnpm lint` / `lint:fix` | ESLint                                   |
| `pnpm generate:types`  | Regenerate `src/payload-types.ts`          |
| `pnpm generate:importmap` | Regenerate Payload's admin import map   |
| `pnpm migrate`         | Apply database migrations                  |
| `pnpm migrate:create`  | Create a migration                         |
| `pnpm test`            | Integration (Vitest) + e2e (Playwright)    |
| `pnpm test:int`        | Integration tests only (Vitest)            |
| `pnpm test:e2e`        | End-to-end tests only (Playwright)         |

## Project structure

| Path                  | Contents                                             |
| --------------------- | ----------------------------------------------------- |
| `src/collections`     | Payload collections (Pages, Updates, Media, Users, Form Submissions, etc.) |
| `src/blocks`          | Layout building blocks used by the page/update editors |
| `src/heros`           | Hero section variants                                  |
| `src/access`          | Access-control functions for collections/globals       |
| `src/endpoints`       | Custom REST endpoints (e.g. seed)                      |
| `src/plugins`         | Payload plugin configuration                           |
| `src/migrations`      | Committed database migrations                          |
| `src/app`             | Next.js App Router routes (frontend + Payload admin)   |
| `src/middleware.ts`   | Security headers, rate limiting                        |
| `tests`               | Vitest integration tests and Playwright e2e tests      |
