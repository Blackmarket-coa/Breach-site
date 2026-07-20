import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { SITE_NAME } from '@/utilities/siteMetadata'
import { auditFormSubmission } from '@/hooks/auditLog'
import { verifyFormSubmission } from '@/hooks/verifyFormSubmission'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${SITE_NAME}` : SITE_NAME
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

// Serverless hosts (e.g. Vercel) have an ephemeral, read-only filesystem, so
// uploads written to `public/media` on disk do not persist. When S3 credentials
// are provided we store media in an S3-compatible bucket (Supabase Storage)
// instead. Files are still served through Payload's own route (same origin, so
// no CSP img-src changes needed); the bucket can stay private. Without these
// env vars — local dev and CI — media falls back to local disk unchanged.
//
// NOTE: this plugin (with clientUploads) registers an admin component
// (S3ClientUploadHandler). The committed admin import map therefore MUST include
// it, or the admin panel fails to render in production. Regenerate the import
// map with the S3_* vars set: `S3_BUCKET=… … pnpm generate:importmap`.
const s3StorageConfigured = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY,
)

// Private uploads (request-documents) go to a SEPARATE bucket that must NOT be
// public — the media bucket is public so it can serve site images. Create a
// private bucket in Supabase Storage and set S3_PRIVATE_BUCKET to its name.
const s3PrivateBucket = process.env.S3_PRIVATE_BUCKET
const privateUploadsConfigured = s3StorageConfigured && Boolean(s3PrivateBucket)

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      hooks: {
        afterChange: [auditFormSubmission],
        beforeChange: [verifyFormSubmission],
      },
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  ...(s3StorageConfigured
    ? [
        s3Storage({
          collections: {
            media: true,
          },
          // Upload straight from the browser to S3 via a presigned URL. Vercel
          // caps function request bodies at 4.5 MB, so routing uploads through
          // Payload would reject larger files — and this collection allows PDFs
          // (official notices) that can exceed that. Presigned uploads are
          // gated to authenticated users by default (matches Media's create
          // access). Requires the bucket to allow CORS from the site origin.
          clientUploads: true,
          bucket: process.env.S3_BUCKET,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            // Supabase Storage's S3 endpoint requires path-style addressing.
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
          },
        }),
      ]
    : []),
  // Private uploads collection in its own PRIVATE bucket: objects use a private
  // ACL and are only ever served through short-lived signed URLs, generated
  // after Payload's admin-only access control runs. This keeps client-submitted
  // documents off the public web even though the media bucket is public.
  ...(privateUploadsConfigured
    ? [
        s3Storage({
          collections: {
            'request-documents': true,
          },
          acl: 'private',
          signedDownloads: true,
          bucket: s3PrivateBucket as string,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
            },
          },
        }),
      ]
    : []),
]
