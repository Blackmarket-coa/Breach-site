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
                `Beginning in or around ${INCIDENT.breachBegan}, an unauthorized party gained access to devices, systems, and accounts used in connection with this work and used that access, and the identity of the business owner, without authorization. The incident was discovered in ${INCIDENT.discovered}. Unauthorized activity associated with the incident has continued to be identified through ${INCIDENT.activityIdentifiedThrough}. The matter has been reported to law enforcement and remains under investigation.`,
              ),
            ),
            paragraph(
              text(
                'The affected hardware included both business and personal devices used in connection with that work, along with a personal email account that was also compromised. An earlier description of this incident referred only to business hardware; the investigation has since shown that the unauthorized access was broader than that, and this notice reflects the corrected description. The full extent of the access across specific devices remains under investigation.',
              ),
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
                'Based on the nature of the incident, the personal information that was or may have been subject to unauthorized access or acquisition may have included prior clients’ names and contact information (such as mailing address, telephone number, and email address) and financial account information, or other information that would permit access to a financial account or resources. The full scope of the categories of information involved is still being determined through the ongoing investigation, and this notice will be updated as more is confirmed.',
              ),
            ),

            heading('h2', text('Who Is Affected')),
            paragraph(
              text(
                `Based on current estimates, ${INCIDENT.affectedCountApprox} individuals are potentially affected. Many affected individuals did not state their state of residence when they provided their information, so residency cannot be determined from available records for a substantial number of them. For that reason, this notice is addressed to all potentially affected individuals regardless of where they live, and it should not be read as limited to the residents of any one state.`,
              ),
            ),

            heading('h2', text('What We Are Doing')),
            paragraph(
              text(
                `Steps have been taken to protect personal information from further unauthorized access, including securing and replacing affected devices, securing affected accounts and systems, reporting the matter to law enforcement and cooperating with that process, notifying affected individuals, notifying the appropriate consumer protection authorities in ${INCIDENT.statesFiledCount} states, and establishing this website and a dedicated contact channel where affected individuals can obtain information and assistance.`,
              ),
            ),
            paragraph(
              text(
                `The ${INCIDENT.recordOwnerCount} companies that own the affected loan records are being notified separately, as required by ${INCIDENT.statuteFull}(b).`,
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
              text(
                ' states. Those offices are not handling inquiries about this incident. For questions about this notice, please use the incident contact channel above rather than contacting a state Attorney General’s office.',
              ),
            ),
            paragraph(
              bold('Federal Trade Commission'),
              text(
                ' — Consumer Response Center, 600 Pennsylvania Avenue NW, Washington, DC 20580 — 1-877-438-4338 (1-877-IDTHEFT) — ftc.gov / identitytheft.gov',
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
