import type { RequiredDataFromCollectionSlug } from 'payload'

import { heading, link, paragraph, root, text } from './lexical'

export const faqPage: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'faq',
  _status: 'published',
  title: 'Frequently Asked Questions',
  hero: {
    type: 'lowImpact',
    richText: root(
      heading('h1', text('Frequently Asked Questions')),
      paragraph(
        text(
          'Answers to common questions about the incident. This page will be updated as the investigation progresses.',
        ),
      ),
    ),
  },
  layout: [
    {
      blockType: 'faq',
      items: [
        {
          question: 'How do I know if I am affected?',
          answer: root(
            paragraph(
              text(
                '[PLACEHOLDER — describe who is potentially affected, e.g. clients of the business during the period from [YEAR] to [YEAR]. If direct notice was mailed or emailed, say so here.]',
              ),
            ),
          ),
        },
        {
          question: 'What should I do right now?',
          answer: root(
            paragraph(
              text(
                'Remain vigilant: review your account statements and monitor your free credit reports. Consider placing a fraud alert or security freeze with the consumer reporting agencies. Step-by-step information is on our ',
              ),
              link('/resources', 'resources page'),
              text('.'),
            ),
          ),
        },
        {
          question: 'I was contacted about a cryptocurrency investment. Is that related?',
          answer: root(
            paragraph(
              text(
                '[PLACEHOLDER — pending guidance from the investigating agency. If you received investment or cryptocurrency solicitations purporting to come from this business, do not respond or send funds. Report it via the contact information on this site, to the FTC at reportfraud.ftc.gov, and to the FBI at ic3.gov.]',
              ),
            ),
          ),
        },
        {
          question: 'Who is investigating this incident?',
          answer: root(
            paragraph(
              text(
                'The matter is under active investigation by the North Carolina Department of Justice. [PLACEHOLDER — update as other agencies or states open investigations.]',
              ),
            ),
          ),
        },
        {
          question: 'Will this website be updated?',
          answer: root(
            paragraph(
              text('Yes. New information is posted on the '),
              link('/updates', 'Investigation Updates'),
              text(' page as it becomes available.'),
            ),
          ),
        },
        {
          question: 'How can I get more information or assistance?',
          answer: root(
            paragraph(
              text(
                'Call the dedicated incident line at [PHONE NUMBER — TBD], email [EMAIL — TBD], or use the ',
              ),
              link('/contact', 'contact page'),
              text(
                '. Please do not include Social Security numbers or account numbers in messages.',
              ),
            ),
          ),
        },
      ],
    },
  ],
  meta: {
    title: 'FAQ',
    description:
      'Frequently asked questions about the data security incident, who is affected, and what steps to take.',
  },
}
