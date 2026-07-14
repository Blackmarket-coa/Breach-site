import type { RequiredDataFromCollectionSlug } from 'payload'

import { bold, heading, paragraph, root, text } from './lexical'

/**
 * Identity theft and consumer protection resources, per the agency contact
 * information required by N.C. Gen. Stat. § 75-65(d)(6) and (d)(7).
 */
export const resourcesPage: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'resources',
  _status: 'published',
  title: 'Identity Theft & Consumer Resources',
  hero: {
    type: 'lowImpact',
    richText: root(
      heading('h1', text('Identity Theft & Consumer Resources')),
      paragraph(
        text(
          'You can obtain information from the agencies below about steps you can take to prevent identity theft. You are encouraged to remain vigilant by reviewing your account statements and monitoring your free credit reports for signs of unauthorized activity.',
        ),
      ),
    ),
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: root(heading('h2', text('Nationwide Consumer Reporting Agencies'))),
        },
        {
          size: 'oneThird',
          richText: root(
            heading('h3', text('Equifax')),
            paragraph(text('P.O. Box 740241')),
            paragraph(text('Atlanta, GA 30374-0241')),
            paragraph(bold('1-800-685-1111')),
            paragraph(text('www.equifax.com')),
          ),
        },
        {
          size: 'oneThird',
          richText: root(
            heading('h3', text('Experian')),
            paragraph(text('P.O. Box 9554')),
            paragraph(text('Allen, TX 75013')),
            paragraph(bold('1-888-397-3742')),
            paragraph(text('www.experian.com')),
          ),
        },
        {
          size: 'oneThird',
          richText: root(
            heading('h3', text('TransUnion')),
            paragraph(text('P.O. Box 2000')),
            paragraph(text('Chester, PA 19016')),
            paragraph(bold('1-800-916-8800')),
            paragraph(text('www.transunion.com')),
          ),
        },
        {
          size: 'full',
          richText: root(
            heading('h2', text('Free Credit Reports')),
            paragraph(
              text(
                'You may obtain a free copy of your credit report from each of the three nationwide consumer reporting agencies once every 12 months at www.annualcreditreport.com, by calling toll-free 1-877-322-8228, or by mailing a request to: Annual Credit Report Request Service, P.O. Box 105281, Atlanta, GA 30348-5281.',
              ),
            ),
          ),
        },
        {
          size: 'half',
          richText: root(
            heading('h3', text('Federal Trade Commission')),
            paragraph(text('Consumer Response Center')),
            paragraph(text('600 Pennsylvania Avenue NW')),
            paragraph(text('Washington, DC 20580')),
            paragraph(bold('1-877-438-4338'), text(' (1-877-IDTHEFT)')),
            paragraph(text('www.ftc.gov — www.identitytheft.gov')),
          ),
        },
        {
          size: 'half',
          richText: root(
            heading('h3', text('North Carolina Attorney General’s Office')),
            paragraph(text('Consumer Protection Division')),
            paragraph(text('9001 Mail Service Center')),
            paragraph(text('Raleigh, NC 27699-9001')),
            paragraph(bold('1-877-566-7226'), text(' (1-877-5-NO-SCAM)')),
            paragraph(text('www.ncdoj.gov')),
          ),
        },
        {
          size: 'full',
          richText: root(
            heading('h2', text('Fraud Alerts and Security Freezes')),
            paragraph(
              text(
                'A fraud alert tells creditors to take extra steps to verify your identity before opening new accounts in your name. A security freeze restricts access to your credit file, making it harder for identity thieves to open accounts. Both are free. You can place them by contacting each of the three consumer reporting agencies listed above.',
              ),
            ),
            heading('h2', text('Reporting Identity Theft and Fraud')),
            paragraph(
              text(
                'If you believe you are a victim of identity theft, report it and get a recovery plan at www.identitytheft.gov. Suspected fraud, including unsolicited investment or cryptocurrency offers, can be reported to the FTC at reportfraud.ftc.gov and to the FBI’s Internet Crime Complaint Center at www.ic3.gov.',
              ),
            ),
          ),
        },
      ],
    },
  ],
  meta: {
    title: 'Identity Theft & Consumer Resources',
    description:
      'Contact information for the nationwide consumer reporting agencies, the FTC, and the North Carolina Attorney General’s Office, with steps to prevent identity theft.',
  },
}
