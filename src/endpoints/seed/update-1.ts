import type { Category, Media } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

import { INCIDENT } from './incident-details'
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
        `The official security incident notice has been posted on this website pursuant to ${INCIDENT.statuteFull}. The incident, which involves unauthorized access beginning in or around ${INCIDENT.breachBegan} and the unauthorized use of the business owner’s identity to conduct cryptocurrency activity through ${INCIDENT.activityIdentifiedThrough}, was discovered in ${INCIDENT.discovered}. It has been reported to law enforcement and remains under investigation.`,
      ),
    ),
    paragraph(
      text(
        `The notice has been updated to correct an earlier description of the affected hardware. The access involved both business and personal devices used in connection with this work, along with a personal email account, and was broader than the earlier reference to business hardware indicated. The full extent across specific devices remains under investigation.`,
      ),
    ),
    paragraph(
      text(
        `A dedicated line and email have been established for potentially affected prior clients to obtain information and assistance. Notice of the incident has been filed with the appropriate consumer protection authorities in ${INCIDENT.statesFiledCount} states, and the ${INCIDENT.recordOwnerCount} companies that own the affected loan records are being notified as required by ${INCIDENT.statuteFull}(b). Those consumer protection offices are not handling inquiries about this incident — please use the contact channel on this site.`,
      ),
    ),
    paragraph(
      text(
        'Future updates will be published on this page as information becomes available and as the ongoing investigation permits.',
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
