import type { CollectionSlug, File, GlobalSlug, Payload, PayloadRequest } from 'payload'

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { faqPage } from './faq-page'
import { home } from './home'
import { imageHero1 } from './image-hero-1'
import { resourcesPage } from './resources-page'
import { securityNoticePage } from './security-notice-page'
import { update1 } from './update-1'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const collections: CollectionSlug[] = [
  'audit-logs',
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = [
  { title: 'Official Notices', slug: 'official-notices' },
  { title: 'Investigation', slug: 'investigation' },
  { title: 'Consumer Protection', slug: 'consumer-protection' },
]

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // Clear collections and globals so the seed is idempotent — the custom
  // `/next/seed` endpoint does not drop the database.
  payload.logger.info(`— Clearing collections and globals...`)

  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding media and categories...`)

  const heroImageFile = await loadLocalFile(path.resolve(dirname, 'image-hero1.webp'))

  const [heroImageDoc, ...categoryDocs] = await Promise.all([
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: heroImageFile,
    }),
    ...categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: category,
      }),
    ),
  ])

  const investigationCategory = categoryDocs.find((c) => c.slug === 'investigation')

  payload.logger.info(`— Seeding investigation updates...`)

  await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: update1({ category: investigationCategory, heroImage: heroImageDoc }),
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info(`— Seeding pages...`)

  const [, securityNoticeDoc, faqDoc, resourcesDoc, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: securityNoticePage,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: faqPage,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: resourcesPage,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm }),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  const pageRef = (page: { id: number }, label: string) => ({
    link: {
      type: 'reference' as const,
      label,
      reference: {
        relationTo: 'pages' as const,
        value: page.id,
      },
    },
  })

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          pageRef(securityNoticeDoc, 'Security Notice'),
          {
            link: {
              type: 'custom',
              label: 'Updates',
              url: '/updates',
            },
          },
          pageRef(faqDoc, 'FAQ'),
          pageRef(resourcesDoc, 'Resources'),
          {
            link: {
              type: 'custom',
              label: 'Request Information',
              url: '/request-information',
            },
          },
          pageRef(contactPage, 'Contact'),
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          pageRef(securityNoticeDoc, 'Security Incident Notice'),
          pageRef(resourcesDoc, 'Identity Theft Resources'),
          pageRef(contactPage, 'Contact'),
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function loadLocalFile(filePath: string): Promise<File> {
  const data = await fs.readFile(filePath)

  return {
    name: path.basename(filePath),
    data,
    mimetype: `image/${path.extname(filePath).slice(1)}`,
    size: data.byteLength,
  }
}
