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
    heading('h2', text('Notice Posted')),
    paragraph(
      text(
        'The official security incident notice has been posted on this website pursuant to N.C. Gen. Stat. § 75-65. The incident, which involves unauthorized access beginning in or around 2019 and the unauthorized use of the business owner’s identity to conduct cryptocurrency activity through February 2026, remains under active investigation by the North Carolina Department of Justice.',
      ),
    ),
    paragraph(
      text(
        'A dedicated line and email have been established for potentially affected prior clients to obtain information and assistance. Notice is also being provided to consumer protection authorities in other states.',
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
