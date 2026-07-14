import type { Category, Media } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

import { heading, paragraph, root, text } from './lexical'

type Update1Args = {
  category?: Category
  heroImage?: Media
}

export const update1: (args: Update1Args) => RequiredDataFromCollectionSlug<'posts'> = ({
  category,
  heroImage,
}) => ({
  slug: 'website-notice-published',
  _status: 'published',
  title: 'Website Notice Published',
  categories: category ? [category.id] : [],
  heroImage: heroImage?.id,
  content: root(
    paragraph(
      text(
        '[PLACEHOLDER — sample investigation update. Replace with your first real update before launch.]',
      ),
    ),
    heading('h2', text('Notice Posted')),
    paragraph(
      text(
        'The official security incident notice has been posted on this website pursuant to N.C. Gen. Stat. § 75-65. The incident remains under active investigation by the North Carolina Department of Justice.',
      ),
    ),
    paragraph(
      text(
        'Future updates will be published on this page as information becomes available and as the investigating agency permits.',
      ),
    ),
  ),
  meta: {
    title: 'Website Notice Published',
    description:
      'The official security incident notice is now available on this website. The investigation is ongoing.',
    image: heroImage?.id,
  },
})
