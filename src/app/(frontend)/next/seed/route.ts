import { createLocalReq } from 'payload'
import { seed } from '@/endpoints/seed'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

// Build a human-readable cause chain (name/code/message) so seeding failures —
// e.g. an S3 misconfiguration (`NoSuchBucket`, `AccessDenied`,
// `SignatureDoesNotMatch`) or a filesystem error (`ENOENT`, `EROFS`) — are
// visible to the admin who triggered the seed instead of an opaque 500.
function describeError(error: unknown): string {
  const parts: string[] = []
  let current: unknown = error
  for (let depth = 0; current && typeof current === 'object' && depth < 5; depth++) {
    const err = current as { name?: unknown; code?: unknown; message?: unknown; cause?: unknown }
    const label = [err.name, err.code].filter((v) => typeof v === 'string').join(' ')
    const message = typeof err.message === 'string' ? err.message : ''
    const piece = [label, message].filter(Boolean).join(': ')
    if (piece) parts.push(piece)
    current = err.cause
  }
  return parts.join(' ← ') || String(error)
}

export async function POST(): Promise<Response> {
  // Everything is inside the try/catch — including getPayloadClient() and
  // auth() — so a database connection failure (e.g. a transient Supabase
  // pooler timeout) surfaces as a readable message instead of an opaque 500
  // with an empty body.
  let payload: Awaited<ReturnType<typeof getPayloadClient>> | undefined
  try {
    payload = await getPayloadClient()
    const requestHeaders = await headers()

    // Authenticate by passing request headers
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return new Response('Action forbidden.', { status: 403 })
    }

    // Create a Payload request object to pass to the Local API for transactions
    // At this point you should pass in a user, locale, and any other context you need for the Local API
    const payloadReq = await createLocalReq({ user }, payload)

    await seed({ payload, req: payloadReq })

    return Response.json({ success: true })
  } catch (e) {
    payload?.logger?.error({ err: e, message: 'Error seeding data' })
    // Endpoint is authenticated (admin-only), so returning the cause is safe and
    // makes setup problems (e.g. media storage, DB connectivity) diagnosable
    // without digging through server logs.
    return new Response(`Error seeding data: ${describeError(e)}`, { status: 500 })
  }
}
