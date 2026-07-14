import type { CollectionAfterChangeHook, Payload, PayloadRequest } from 'payload'

type AuditAction = 'form-submission' | 'forgot-password' | 'login' | 'login-failed' | 'logout'

type LogAuditArgs = {
  action: AuditAction
  detail?: Record<string, unknown>
  payload: Payload
  req?: PayloadRequest
  resource?: string
  userId?: null | number
}

/**
 * Best-effort append to the audit-logs collection via the Local API.
 * Never throws — audit logging must not block the action being logged.
 */
export const logAudit = async ({
  action,
  detail,
  payload,
  req,
  resource,
  userId,
}: LogAuditArgs): Promise<void> => {
  try {
    await payload.create({
      collection: 'audit-logs',
      data: {
        action,
        detail,
        ip:
          req?.headers?.get('cf-connecting-ip') ||
          req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          undefined,
        resource,
        user: userId ?? undefined,
        userAgent: req?.headers?.get('user-agent') || undefined,
      },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error({ msg: 'Failed to write audit log', err })
  }
}

/** afterChange hook for form-submissions: audit each new submission. */
export const auditFormSubmission: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    await logAudit({
      action: 'form-submission',
      payload: req.payload,
      req,
      resource: String(doc.id),
    })
  }

  return doc
}
