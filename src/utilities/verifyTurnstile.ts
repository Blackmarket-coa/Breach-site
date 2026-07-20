const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type VerifyResult = { ok: true } | { ok: false; reason: string }

/**
 * Server-side Cloudflare Turnstile verification, shared by the form-submission
 * hook and the custom request-information endpoint.
 *
 * If TURNSTILE_SECRET_KEY is unset we skip verification (local/dev only) and
 * say so via the logger, matching the behavior of verifyFormSubmission.
 */
export async function verifyTurnstile(
  token: string | undefined,
  opts: { remoteip?: string; warn?: (msg: string) => void } = {},
): Promise<VerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    opts.warn?.(
      'TURNSTILE_SECRET_KEY is not set — skipping Turnstile verification. Do not run production without it.',
    )
    return { ok: true }
  }

  if (!token) {
    return { ok: false, reason: 'missing-token' }
  }

  let outcome: { success?: boolean; 'error-codes'?: string[] }
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        ...(opts.remoteip ? { remoteip: opts.remoteip } : {}),
      }),
    })
    outcome = (await response.json()) as { success?: boolean; 'error-codes'?: string[] }
  } catch {
    return { ok: false, reason: 'verification-request-failed' }
  }

  if (!outcome.success) {
    return { ok: false, reason: (outcome['error-codes'] || []).join(',') || 'verification-failed' }
  }

  return { ok: true }
}
