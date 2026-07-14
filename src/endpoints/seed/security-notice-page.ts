import type { RequiredDataFromCollectionSlug } from 'payload'

import { bold, heading, link, paragraph, root, text } from './lexical'

/**
 * Placeholder for the official security incident notice, structured around the
 * seven content elements required by N.C. Gen. Stat. § 75-65(d). Every
 * [BRACKETED] passage is placeholder text that MUST be replaced with the
 * business's own reviewed statement before publication.
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
          'This notice is posted pursuant to N.C. Gen. Stat. § 75-65. Posted on [DATE]. Last updated [DATE].',
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
            paragraph(
              bold(
                '[DRAFT PLACEHOLDER — This entire notice is placeholder text. Replace every bracketed section with your own statement, reviewed with the investigating agency, before publishing.]',
              ),
            ),

            heading('h2', text('What Happened')),
            paragraph(
              text(
                '[Describe the incident in general terms: an unauthorized party gained access to systems/accounts beginning in or around [YEAR]. The incident was discovered on [DATE]. Law enforcement was notified and the matter is under active investigation by the North Carolina Department of Justice. Do not include details that could impede the investigation.]',
              ),
            ),

            heading('h2', text('What Information Was Involved')),
            paragraph(
              text(
                '[Describe the types of personal information that were or may have been subject to unauthorized access or acquisition — for example: names, addresses, email addresses, telephone numbers, financial account information. Be specific about categories, not individuals.]',
              ),
            ),

            heading('h2', text('What We Are Doing')),
            paragraph(
              text(
                '[Describe the general steps taken to protect personal information from further unauthorized access — for example: securing affected accounts and systems, engaging law enforcement, notifying affected individuals and state authorities, establishing this website and a dedicated contact line.]',
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
            paragraph(
              text('Telephone: '),
              bold('[DEDICATED INCIDENT PHONE NUMBER — TBD]'),
              text(' — Email: '),
              bold('[DEDICATED INCIDENT EMAIL — TBD]'),
            ),
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

            heading(
              'h2',
              text('Federal Trade Commission and North Carolina Attorney General'),
            ),
            paragraph(
              text(
                'You can obtain information from the Federal Trade Commission and the North Carolina Attorney General’s Office about steps you can take to prevent identity theft.',
              ),
            ),
            paragraph(
              bold('Federal Trade Commission'),
              text(
                ' — Consumer Response Center, 600 Pennsylvania Avenue NW, Washington, DC 20580 — 1-877-438-4338 (1-877-IDTHEFT) — ftc.gov / identitytheft.gov',
              ),
            ),
            paragraph(
              bold('North Carolina Attorney General’s Office'),
              text(
                ' — Consumer Protection Division, 9001 Mail Service Center, Raleigh, NC 27699-9001 — 1-877-566-7226 (1-877-5-NO-SCAM) — ncdoj.gov',
              ),
            ),

            heading('h2', text('Cryptocurrency Investment Solicitations')),
            paragraph(
              text(
                '[PLACEHOLDER — pending guidance from the investigating agency: if you were contacted about cryptocurrency or other investment opportunities purporting to be from this business, that contact was not authorized. Describe how affected individuals should report it and which dedicated contact to use.] You may report suspected fraud to the FTC at reportfraud.ftc.gov and to the FBI’s Internet Crime Complaint Center at ic3.gov.',
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
      'Official notice of a data security incident posted pursuant to N.C. Gen. Stat. § 75-65, with information and assistance for potentially affected individuals.',
  },
}
