import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { authenticated } from '../../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * PRIVATE document uploads attached to information requests.
 *
 * Unlike Media (which is public — it serves the site's images and posted
 * notices), these are documents submitted by potentially-affected individuals
 * and may contain personal information. Every access rule is admin-only:
 *
 * - `read`/`update`/`delete`: authenticated admins only, so files are never
 *   publicly listable or downloadable through the API.
 * - `create`: also admins only; public submissions are created server-side by
 *   the /next/request-information endpoint using `overrideAccess`, so the
 *   public never gets direct create access to this collection.
 *
 * In production these are stored in a dedicated PRIVATE S3 bucket
 * (S3_PRIVATE_BUCKET) with a private ACL and signed downloads — see
 * src/plugins/index.ts. They must not share the public media bucket.
 */
export const RequestDocuments: CollectionConfig = {
  slug: 'request-documents',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Information Requests',
    description:
      'Private documents uploaded with information requests. Admin-only; not publicly accessible.',
  },
  fields: [
    {
      name: 'submitterNote',
      type: 'text',
      admin: {
        description: 'Optional label captured at upload time.',
        readOnly: true,
      },
    },
  ],
  upload: {
    // Deliberately NOT under public/ — these files must never be served
    // statically. In production the S3 plugin stores them in the private bucket.
    staticDir: path.resolve(dirname, '../../../.private-uploads/request-documents'),
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
  },
}
