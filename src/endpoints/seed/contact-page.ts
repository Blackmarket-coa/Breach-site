import type { Form } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

import { EMAIL_LINK_LABEL, INCIDENT, emailHref, hasEmail, hasPhone } from './incident-details'
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
    // The address itself is never printed — the button below opens the visitor's
    // mail client. Keeping the raw address off the page avoids scraping.
    channelNodes.push(
      paragraph(text('Prefer email? Use the button below to reach the incident team.')),
    )
  }
  if (!hasPhone() && !hasEmail()) {
    channelNodes.push(
      paragraph(
        text(
          'A dedicated telephone line and email address for this incident are being established and will be posted here as soon as they are active. In the meantime, please use the secure message form below.',
        ),
      ),
    )
  }

  const incidentLineColumn = {
    size: 'half' as const,
    richText: root(heading('h2', text('Dedicated Incident Line')), ...channelNodes),
    ...(hasEmail()
      ? {
          enableLink: true,
          link: {
            type: 'custom' as const,
            appearance: 'default' as const,
            label: EMAIL_LINK_LABEL,
            url: emailHref(),
          },
        }
      : {}),
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
          incidentLineColumn,
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
