import type { CollectionBeforeChangeHook } from 'payload'

import { APIError } from 'payload'

const MAX_FIELDS = 20
const MAX_VALUE_LENGTH = 5000
const TURNSTILE_TOKEN_FIELD = 'cfTurnstileToken'
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type SubmissionEntry = {
  field?: unknown
  value?: unknown
}

/**
 * beforeChange hook for form-submissions: enforces input size caps and
 * verifies the Cloudflare Turnstile token server-side. The token entry is
 * stripped from the stored submission data either way.
 */
export const verifyFormSubmission: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') {
    return data
  }

  const submissionData: SubmissionEntry[] = Array.isArray(data?.submissionData)
    ? data.submissionData
    : []

  if (submissionData.length > MAX_FIELDS) {
    throw new APIError('Submission rejected: too many fields.', 400)
  }

  for (const entry of submissionData) {
    if (typeof entry?.value === 'string' && entry.value.length > MAX_VALUE_LENGTH) {
      throw new APIError('Submission rejected: field value too long.', 400)
    }
  }

  const tokenEntry = submissionData.find((entry) => entry?.field === TURNSTILE_TOKEN_FIELD)
  const token = typeof tokenEntry?.value === 'string' ? tokenEntry.value : undefined

  data.submissionData = submissionData.filter(
    (entry) => entry?.field !== TURNSTILE_TOKEN_FIELD,
  )

  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    req.payload.logger.warn(
      'TURNSTILE_SECRET_KEY is not set — skipping Turnstile verification. Do not run production without it.',
    )
    return data
  }

  if (!token) {
    throw new APIError('Human verification failed. Please try again.', 400)
  }

  const remoteip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  const response = await fetch(SITEVERIFY_URL, {
    body: JSON.stringify({
      secret,
      response: token,
      ...(remoteip ? { remoteip } : {}),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const outcome = (await response.json()) as { 'error-codes'?: string[]; success?: boolean }

  if (!outcome.success) {
    req.payload.logger.info({
      msg: 'Turnstile verification failed',
      errorCodes: outcome['error-codes'],
    })
    throw new APIError('Human verification failed. Please try again.', 400)
  }

  return data
}
