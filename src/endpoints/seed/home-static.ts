import type { RequiredDataFromCollectionSlug } from 'payload'

import { heading, link, paragraph, root, text } from './lexical'

// Fallback homepage shown before the database has been seeded
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  title: 'Incident Response Portal',
  hero: {
    type: 'lowImpact',
    richText: root(
      heading('h1', text('Incident Response Portal')),
      paragraph(
        text('This site has not been set up yet. '),
        link('/admin', 'Visit the admin dashboard'),
        text(' to create an administrator account and seed the initial content.'),
      ),
    ),
  },
  meta: {
    description: 'Official information about a data security incident.',
    title: 'Incident Response Portal',
  },
  layout: [],
}
