import type { Form } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

import { bold, heading, paragraph, root, text } from './lexical'

type ContactArgs = {
  contactForm: Form
}

export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
}) => {
  return {
    slug: 'contact',
    _status: 'published',
    title: 'Contact',
    hero: {
      type: 'lowImpact',
      richText: root(
        heading('h1', text('Contact')),
        paragraph(
          text(
            'A dedicated phone line and email address have been established for questions about this incident.',
          ),
        ),
      ),
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'half',
            richText: root(
              heading('h2', text('Dedicated Incident Line')),
              paragraph(text('Telephone: '), bold('[PHONE NUMBER — TBD]')),
              paragraph(text('Email: '), bold('[EMAIL ADDRESS — TBD]')),
              paragraph(text('[Hours of availability — TBD]')),
            ),
          },
          {
            size: 'half',
            richText: root(
              heading('h2', text('Before You Reach Out')),
              paragraph(
                text(
                  'Please do not include Social Security numbers, account numbers, passwords, or other sensitive personal information in emails or messages sent through this site.',
                ),
              ),
              paragraph(
                text(
                  'If you believe you are a victim of identity theft, also see the resources page for the FTC and North Carolina Attorney General reporting channels.',
                ),
              ),
            ),
          },
        ],
      },
      {
        blockType: 'formBlock',
        enableIntro: true,
        form: contactForm,
        introContent: root(
          heading('h3', text('Send a Message')),
          paragraph(
            text(
              'You may also send a message using this form. It is protected against automated abuse, and messages are delivered only to the incident response administrator.',
            ),
          ),
        ),
      },
    ],
    meta: {
      title: 'Contact',
      description:
        'Contact the dedicated incident response line by phone, email, or secure message.',
    },
  }
}
