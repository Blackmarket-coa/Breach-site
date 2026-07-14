import type { CollectionSlug } from 'payload'

/**
 * Public route prefix for each collection that has front-end pages.
 * The `posts` collection is surfaced as "Investigation Updates" at `/updates`,
 * while its internal slug stays `posts` (plugins and the DB schema depend on it).
 */
export const collectionRoutePrefix: Partial<Record<CollectionSlug, string>> = {
  pages: '',
  posts: '/updates',
}

export const getDocumentHref = ({
  relationTo,
  slug,
}: {
  relationTo: string
  slug?: null | string
}): string => {
  const prefix = collectionRoutePrefix[relationTo as CollectionSlug] ?? ''
  return `${prefix}/${slug ?? ''}`
}
