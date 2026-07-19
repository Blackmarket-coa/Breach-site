import type { RequiredDataFromCollectionSlug } from 'payload'

import { heading, link, paragraph, root, text } from './lexical'

export const home: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  title: 'Home',
  hero: {
    type: 'lowImpact',
    richText: root(
      heading('h1', text('Notice of Data Security Incident')),
      paragraph(
        text(
          'This website provides information about a data security incident, resources for potentially affected individuals, and updates on the ongoing investigation.',
        ),
      ),
    ),
    links: [
      {
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'Read the Official Notice',
          url: '/security-incident-notice',
        },
      },
      {
        link: {
          type: 'custom',
          appearance: 'outline',
          label: 'Get Help & Resources',
          url: '/resources',
        },
      },
    ],
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: root(
            heading('h2', text('About This Site')),
            paragraph(
              text(
                'A data security incident affecting the personal information of prior clients was discovered in February 2026 and is under active investigation by the North Carolina Department of Justice. The unauthorized activity is believed to have taken place between 2019 and February 2026 and included the unauthorized use of the business owner’s identity to conduct cryptocurrency activity. This website is the official source of information about the incident and the resources available to those who may be affected.',
              ),
            ),
          ),
        },
        {
          size: 'oneThird',
          richText: root(
            heading('h3', text('Official Notice')),
            paragraph(
              text(
                'The full security incident notice, posted pursuant to N.C. Gen. Stat. § 75-65.',
              ),
            ),
          ),
          enableLink: true,
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Read the notice',
            url: '/security-incident-notice',
          },
        },
        {
          size: 'oneThird',
          richText: root(
            heading('h3', text('Questions & Answers')),
            paragraph(text('Common questions about who is affected and what to do next.')),
          ),
          enableLink: true,
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Read the FAQ',
            url: '/faq',
          },
        },
        {
          size: 'oneThird',
          richText: root(
            heading('h3', text('Contact')),
            paragraph(
              text('Reach the dedicated incident line by phone, email, or secure message.'),
            ),
          ),
          enableLink: true,
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Contact us',
            url: '/contact',
          },
        },
      ],
    },
    {
      blockType: 'archive',
      blockName: 'Latest Updates',
      categories: [],
      introContent: root(
        heading('h3', text('Latest Investigation Updates')),
        paragraph(
          text('Updates are posted as the investigation progresses. See the full list on the '),
          link('/updates', 'Investigation Updates'),
          text(' page.'),
        ),
      ),
      populateBy: 'collection',
      relationTo: 'posts',
    },
    {
      blockType: 'cta',
      blockName: 'Crypto fraud CTA',
      richText: root(
        heading('h3', text('Were you contacted about a cryptocurrency investment?')),
        paragraph(
          text(
            'If you were solicited to “invest” in cryptocurrency by someone claiming to represent this business or its owner, that contact was not authorized. Do not respond or send funds. Please contact us, and report it to the FTC at reportfraud.ftc.gov and the FBI at ic3.gov.',
          ),
        ),
      ),
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Contact us',
            url: '/contact',
          },
        },
      ],
    },
  ],
  meta: {
    title: 'Data Security Incident Notice',
    description:
      'Official information about a data security incident, resources for potentially affected individuals, and investigation updates.',
  },
}
