import type { Metadata } from 'next'

import React from 'react'

import { SITE_NAME } from '@/utilities/siteMetadata'
import { RequestInformationForm } from './RequestInformationForm'

export const metadata: Metadata = {
  title: `Request Information | ${SITE_NAME}`,
  description:
    'Potentially affected prior clients can request information about the data security incident and optionally upload a supporting document.',
}

export default function RequestInformationPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Request Information</h1>
        <p className="mb-4 text-lg text-muted-foreground">
          If you believe you may be a potentially affected prior client, you can use this form to
          request information about the incident. You are not required to submit any personal
          information beyond an email address so we can respond, and providing a document is
          optional.
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Anything you submit here is stored privately and is reviewed only by the incident response
          administrator. Please do not include your full Social Security number, full financial
          account numbers, or other highly sensitive details in your message or uploaded files.
        </p>
        <RequestInformationForm />
      </div>
    </div>
  )
}
