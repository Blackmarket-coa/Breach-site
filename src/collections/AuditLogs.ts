import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Append-only security audit trail. Documents are only ever created server-side
 * via the Local API (see src/hooks/auditLog.ts) with overrideAccess — all API
 * access control below is deny-by-default except admin read.
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: {
    singular: 'Audit Log',
    plural: 'Audit Logs',
  },
  access: {
    create: () => false,
    delete: () => false,
    read: authenticated,
    update: () => false,
  },
  admin: {
    defaultColumns: ['action', 'user', 'ip', 'createdAt'],
    useAsTitle: 'action',
    description: 'Append-only log of authentication events and contact form submissions.',
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Login', value: 'login' },
        { label: 'Failed Login', value: 'login-failed' },
        { label: 'Logout', value: 'logout' },
        { label: 'Forgot Password', value: 'forgot-password' },
        { label: 'Form Submission', value: 'form-submission' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'ip',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'resource',
      type: 'text',
      admin: {
        description: 'Identifier of the affected resource, e.g. a form submission ID.',
      },
    },
    {
      name: 'detail',
      type: 'json',
    },
  ],
  timestamps: true,
}
