import type { RequiredDataFromCollectionSlug } from 'payload'

import { INCIDENT, contactChannelNodes } from './incident-details'
import { bold, heading, link, paragraph, root, text } from './lexical'

/**
 * The official security incident notice, structured around the seven content
 * elements required by N.C. Gen. Stat. § 75-65(d). Factual details come from
 * ./incident-details so every page stays consistent.
 */
export const securityNoticePage: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'security-incident-notice',
  _status: 'published',
  title: 'Security Incident Notice',
  hero: {
    type: 'lowImpact',
    richText: root(
      heading('h1', text('Notice of Data Security Incident')),
      paragraph(
        text(
          `This notice is posted by ${INCIDENT.publishedBy} pursuant to applicable state data breach notification laws, including ${INCIDENT.statuteFull}. Posted on ${INCIDENT.postedDate}. Last updated ${INCIDENT.lastUpdated}.`,
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
          richText: root(
            heading('h2', text('What Happened')),
            paragraph(
              text(
                'Beginning in or around 2019, an unauthorized party gained access to systems and accounts associated with this business and used that access, and the identity of the business owner, without authorization. The unauthorized activity continued until it was discovered in February 2026. Upon discovery, the matter was reported to law enforcement and is now under active investigation by ',
              ),
              text(INCIDENT.investigatingAgency + '.'),
            ),

            heading('h2', text('Unauthorized Cryptocurrency Activity')),
            paragraph(
              text(
                'The investigation has determined that, during this period, an unauthorized party used the business owner’s identity to conduct cryptocurrency mining and related transactions without her knowledge or consent. Approximately ',
              ),
              bold('$788 million'),
              text(' in total activity is under investigation, of which approximately '),
              bold('$700,000'),
              text(
                ' has been confirmed to date. These figures are preliminary and may change as the investigation continues.',
              ),
            ),

            heading('h2', text('What Information Was Involved')),
            paragraph(
              text(
                'The specific categories of personal information that were or may have been subject to unauthorized access or acquisition are still being determined through the ongoing investigation. The information at issue is of the type maintained in the ordinary course of the business’s prior client relationships. This notice will be updated as the investigation identifies the specific categories of information involved.',
              ),
            ),

            heading('h2', text('What We Are Doing')),
            paragraph(
              text(
                `The business has taken steps to protect personal information from further unauthorized access, including securing affected accounts and systems, reporting the matter to law enforcement, cooperating fully with the investigating agency, notifying affected individuals, notifying the appropriate consumer protection authorities in ${INCIDENT.statesFiledCount} states, and establishing this website and a dedicated contact channel where affected individuals can obtain information and assistance.`,
              ),
            ),

            heading('h2', text('What You Can Do')),
            paragraph(
              text(
                'Please remain vigilant. Review your account statements regularly and monitor your free credit reports for signs of unauthorized activity. You are entitled to one free credit report every 12 months from each of the three nationwide consumer reporting agencies at annualcreditreport.com or by calling 1-877-322-8228. You may also place a fraud alert or security freeze on your credit file at no cost. See our ',
              ),
              link('/resources', 'Identity Theft & Consumer Resources'),
              text(' page for step-by-step information.'),
            ),

            heading('h2', text('For Further Information and Assistance')),
            paragraph(...contactChannelNodes()),
            paragraph(
              text('You can also reach us through the '),
              link('/contact', 'contact page'),
              text(
                '. Please do not include Social Security numbers, account numbers, or other sensitive personal information in email or form messages.',
              ),
            ),

            heading('h2', text('Nationwide Consumer Reporting Agencies')),
            paragraph(
              bold('Equifax'),
              text(' — P.O. Box 740241, Atlanta, GA 30374-0241 — 1-800-685-1111 — equifax.com'),
            ),
            paragraph(
              bold('Experian'),
              text(' — P.O. Box 9554, Allen, TX 75013 — 1-888-397-3742 — experian.com'),
            ),
            paragraph(
              bold('TransUnion'),
              text(' — P.O. Box 2000, Chester, PA 19016 — 1-800-916-8800 — transunion.com'),
            ),

            heading('h2', text('Federal Trade Commission and State Attorneys General')),
            paragraph(
              text(
                'You can obtain information from the Federal Trade Commission and from your state Attorney General’s office about steps you can take to prevent identity theft. Notice of this incident has been provided to the appropriate consumer protection authorities in ',
              ),
              text(String(INCIDENT.statesFiledCount)),
              text(' states.'),
            ),
            paragraph(
              bold('Federal Trade Commission'),
              text(
                ' — Consumer Response Center, 600 Pennsylvania Avenue NW, Washington, DC 20580 — 1-877-438-4338 (1-877-IDTHEFT) — ftc.gov / identitytheft.gov',
              ),
            ),
            paragraph(
              bold('North Carolina Department of Justice (lead investigating agency)'),
              text(
                ' — Consumer Protection Division, 9001 Mail Service Center, Raleigh, NC 27699-9001 — 1-877-566-7226 (1-877-5-NO-SCAM) — ncdoj.gov',
              ),
            ),
            paragraph(
              bold('Your State Attorney General'),
              text(
                ' — Residents of any state may contact their own state Attorney General’s office. A directory of every state Attorney General is available from the National Association of Attorneys General at ',
              ),
              text(INCIDENT.naagDirectoryUrl),
              text('.'),
            ),

            heading('h2', text('Cryptocurrency Investment Solicitations')),
            paragraph(
              text(
                'The investigation has identified that prior clients of the business were contacted and solicited to “invest” in cryptocurrency by a party purporting to represent the business or its owner. These solicitations were not authorized. If you were contacted about a cryptocurrency or other investment opportunity purporting to come from this business, do not respond or send funds. Please report it using the contact information above, and report suspected fraud to the FTC at reportfraud.ftc.gov and to the FBI’s Internet Crime Complaint Center at ic3.gov.',
              ),
            ),
          ),
        },
      ],
    },
  ],
  meta: {
    title: 'Security Incident Notice',
    description:
      'Official notice of a data security incident posted pursuant to applicable state data breach notification laws, including N.C. Gen. Stat. § 75-65, with information and assistance for potentially affected individuals.',
  },
}
