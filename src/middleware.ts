import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

/**
 * Per-IP sliding-window rate limiting for sensitive POST endpoints.
 *
 * Note: state is in-memory and therefore per-instance — sufficient as a
 * baseline for a single-container deployment. Cloudflare WAF rate-limiting
 * rules are the production-grade layer in front of this (see DEPLOYMENT.md).
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

const RULES: { limit: number; pattern: RegExp; windowMs: number }[] = [
  { pattern: /^\/api\/form-submissions\/?$/, limit: 5, windowMs: 10 * 60 * 1000 },
  { pattern: /^\/api\/users\/login\/?$/, limit: 10, windowMs: 15 * 60 * 1000 },
  { pattern: /^\/api\/users\/forgot-password\/?$/, limit: 3, windowMs: 15 * 60 * 1000 },
]

const getClientIp = (request: NextRequest): string => {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

const purgeExpired = (now: number): void => {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function middleware(request: NextRequest): NextResponse {
  if (request.method !== 'POST') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const rule = RULES.find((r) => r.pattern.test(pathname))

  if (!rule) {
    return NextResponse.next()
  }

  const now = Date.now()
  purgeExpired(now)

  const key = `${getClientIp(request)}:${pathname}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs })
    return NextResponse.next()
  }

  bucket.count += 1

  if (bucket.count > rule.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))

    return new NextResponse(
      JSON.stringify({ errors: [{ message: 'Too many requests. Please try again later.' }] }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
        status: 429,
      },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/form-submissions', '/api/users/login', '/api/users/forgot-password'],
}
