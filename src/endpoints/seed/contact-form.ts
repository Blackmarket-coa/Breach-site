import type { RequiredDataFromCollectionSlug } from 'payload'

import { INCIDENT, defaultFromAddress } from './incident-details'
import { heading, paragraph, root, text } from './lexical'

export const contactForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Contact Form',
  confirmationType: 'message',
  confirmationMessage: root(
    heading('h2', text('Your message has been received.')),
    paragraph(
      text(
        'Thank you for reaching out. Messages are reviewed regularly; if you provided contact information, you may be contacted for follow-up.',
      ),
    ),
  ),
  emails: [
    {
      // From must be a verified sending domain (Resend); default to the site
      // domain, never the Proton inbox. The Proton inbox is the recipient.
      emailFrom: `"Incident Response Portal" <${process.env.EMAIL_FROM_ADDRESS || defaultFromAddress()}>`,
      emailTo: process.env.ADMIN_NOTIFICATION_EMAIL || INCIDENT.email,
      subject: 'New contact form submission',
      message: root(
        paragraph(text('A new message was submitted through the incident response portal:')),
        paragraph(text('Name: {{full-name}}')),
        paragraph(text('Email: {{email}}')),
        paragraph(text('Phone: {{phone}}')),
        paragraph(text('Message: {{message}}')),
      ),
    },
  ],
  fields: [
    {
      name: 'full-name',
      blockName: 'full-name',
      blockType: 'text',
      label: 'Full Name (optional)',
      required: false,
      width: 100,
    },
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email (optional — needed only if you want a response)',
      required: false,
      width: 100,
    },
    {
      name: 'phone',
      blockName: 'phone',
      blockType: 'text',
      label: 'Phone (optional)',
      required: false,
      width: 100,
    },
    {
      name: 'message',
      blockName: 'message',
      blockType: 'textarea',
      label: 'Message',
      required: true,
      width: 100,
    },
  ],
  submitButtonLabel: 'Send Message',
}
