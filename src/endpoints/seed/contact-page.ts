import type { Form } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

import { INCIDENT, hasEmail, hasPhone } from './incident-details'
import { bold, heading, paragraph, root, text } from './lexical'

type ContactArgs = {
  contactForm: Form
}

export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
}) => {
  const channelNodes = []

  if (hasPhone()) {
    channelNodes.push(paragraph(text('Telephone: '), bold(INCIDENT.phone)))
  }
  if (hasEmail()) {
    channelNodes.push(paragraph(text('Email: '), bold(INCIDENT.email)))
  }
  if (channelNodes.length === 0) {
    channelNodes.push(
      paragraph(
        text(
          'A dedicated telephone line and email address for this incident are being established and will be posted here as soon as they are active. In the meantime, please use the secure message form below.',
        ),
      ),
    )
  }

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
            'Use the information below if you have questions about this incident or believe you may be affected. You are not required to submit any personal information to obtain assistance.',
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
            richText: root(heading('h2', text('Dedicated Incident Line')), ...channelNodes),
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
              'You may also send a message using this form. It is protected against automated abuse, and messages are delivered only to the incident response administrator. Providing your contact information is optional and only needed if you would like a response.',
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
