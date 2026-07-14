import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest } from 'payload'

import { collectionRoutePrefix } from '@/utilities/collectionRoutes'

type Props = {
  collection: keyof typeof collectionRoutePrefix
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    path: `${collectionRoutePrefix[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
