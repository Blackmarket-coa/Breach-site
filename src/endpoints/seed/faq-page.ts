import type { RequiredDataFromCollectionSlug } from 'payload'

import { contactChannelSentence } from './incident-details'
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
                'You may be affected if you were a client of the business at any time between 2019 and February 2026, the period during which the unauthorized activity took place. The investigation is still determining the full scope of who and what was affected. If you were a prior client during that period, you should treat yourself as potentially affected and follow the steps on our ',
              ),
              link('/resources', 'resources page'),
              text('.'),
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
                'It may be. The investigation has identified that prior clients were solicited to “invest” in cryptocurrency by a party purporting to represent the business or its owner. These solicitations were not authorized. If you received an investment or cryptocurrency solicitation purporting to come from this business, do not respond or send funds. Report it via the contact information on this site, to the FTC at reportfraud.ftc.gov, and to the FBI at ic3.gov.',
              ),
            ),
          ),
        },
        {
          question: 'Who is investigating this incident?',
          answer: root(
            paragraph(
              text(
                'The matter is under active investigation by the North Carolina Department of Justice, which is the lead agency. Notice of the incident has also been provided to the appropriate consumer protection authorities in 47 states, and additional investigations may be opened as that process continues.',
              ),
            ),
          ),
        },
        {
          question: 'I don’t live in North Carolina — does this apply to me?',
          answer: root(
            paragraph(
              text(
                'Possibly. Although the North Carolina Department of Justice is the lead investigating agency, notice of this incident has been filed in 47 states, and prior clients in many states may be affected. Regardless of where you live, you can follow the steps on our ',
              ),
              link('/resources', 'resources page'),
              text(
                ' and contact your own state Attorney General’s office. A directory of every state Attorney General is available from the National Association of Attorneys General at naag.org/find-my-ag.',
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
              text(' page as it becomes available and as the investigating agency permits.'),
            ),
          ),
        },
        {
          question: 'How can I get more information or assistance?',
          answer: root(paragraph(...contactChannelSentence())),
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
