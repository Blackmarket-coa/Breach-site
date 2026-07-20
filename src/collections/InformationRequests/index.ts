import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

/**
 * Requests for information submitted by potentially-affected individuals via the
 * public /request-information page.
 *
 * Records are created server-side by the /next/request-information endpoint
 * (which verifies Turnstile and validates input) using `overrideAccess`, so the
 * public never gets direct create access. Reading and managing requests is
 * admin-only — this collection holds personal information.
 */
export const InformationRequests: CollectionConfig = {
  slug: 'information-requests',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Information Requests',
    defaultColumns: ['email', 'name', 'status', 'createdAt'],
    useAsTitle: 'email',
    description: 'Requests for information from potentially-affected individuals.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'topic',
          type: 'select',
          admin: { width: '50%' },
          defaultValue: 'general',
          options: [
            { label: 'General information request', value: 'general' },
            { label: 'Believe I am an affected prior client', value: 'affected-client' },
            { label: 'Report a related crypto solicitation', value: 'crypto-solicitation' },
          ],
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'document',
      type: 'upload',
      relationTo: 'request-documents',
      admin: {
        description: 'Optional supporting document uploaded by the requester (private).',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In review', value: 'in-review' },
        { label: 'Responded', value: 'responded' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
