import { bold, link, text, type LexicalNode } from './lexical'

/**
 * Single source of truth for the factual details of the security incident.
 *
 * Every seed page/post/form imports from here so the published notice, FAQ,
 * home page, contact page, and resources stay consistent. To update a fact
 * after launch, change it here and re-run the seed, or edit the page in the
 * Payload admin.
 *
 * The only values intended to be filled in after this file was written are
 * `phone` and `email` — the dedicated incident contact line and mailbox,
 * which are being established separately. Until they are set, the site renders
 * a truthful "being established" sentence instead of a placeholder, so the
 * pages are always publishable.
 */
export const INCIDENT = {
  /** Name the notice is published under, per N.C. Gen. Stat. § 75-65. */
  publishedBy: 'Arielle Cadet-King',

  statuteShort: '§ 75-65',
  statuteFull: 'N.C. Gen. Stat. § 75-65',

  /** Date the notice was first posted and last substantively updated. */
  postedDate: 'July 19, 2026',
  lastUpdated: 'July 19, 2026',

  /** Investigating agency (lead). */
  investigatingAgency: 'the North Carolina Department of Justice',

  /**
   * Number of U.S. states where breach notice has been filed. The notice is
   * posted under applicable state data breach notification laws generally,
   * with North Carolina as the lead jurisdiction (NCDOJ is investigating).
   */
  statesFiledCount: 47,

  /**
   * National Association of Attorneys General consumer directory — the
   * universal, always-current pointer to every state's Attorney General, so
   * residents of any state can find their own office without this site
   * maintaining 50+ addresses.
   */
  naagDirectoryUrl: 'naag.org/find-my-ag',

  /**
   * Dedicated incident contact channel — the new customer-support line and
   * mailbox set up specifically for this incident (not personal contacts).
   */
  phone: '930-410-6815',

  /**
   * PRIVATE inbox. This is where contact-form submissions are delivered. It is
   * NEVER printed on the public site — visitors only get a "click to email"
   * link, and that link points at `publicEmail` below.
   */
  email: 'arielleshrugged@proton.me',

  /**
   * PUBLIC-facing address used for the "Email the incident team" link. Set this
   * to a forwarding alias on a domain you control (e.g. incident@yourdomain,
   * forwarded to the private inbox via Proton custom-domain aliases or a free
   * service like Cloudflare Email Routing) so the real inbox is never exposed.
   * If left blank, the link falls back to the private address.
   */
  publicEmail: '',
} as const

export const hasPhone = (): boolean => INCIDENT.phone.trim().length > 0
export const hasEmail = (): boolean => INCIDENT.email.trim().length > 0

/** The address shown/linked publicly — the alias if set, else the inbox. */
export const publicEmailAddress = (): string =>
  (INCIDENT.publicEmail.trim() || INCIDENT.email).trim()

/** `mailto:` href for the click-to-email link, with a helpful default subject. */
export const emailHref = (): string =>
  `mailto:${publicEmailAddress()}?subject=${encodeURIComponent('Data security incident inquiry')}`

/** Label for the click-to-email link/button. */
export const EMAIL_LINK_LABEL = 'Email the incident team'

/**
 * Default "From" address for outgoing notification email.
 *
 * Resend requires the sender to be on a domain you have verified; a free-mail
 * address (like the incident Proton inbox) can receive mail but will never
 * send. So the From address is derived from the site's own domain — which you
 * can verify in Resend — rather than the Proton inbox. Override any time with
 * EMAIL_FROM_ADDRESS. The Proton inbox stays the *recipient* of submissions.
 */
export const defaultFromAddress = (): string => {
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')

  let host = 'localhost'
  try {
    host = new URL(serverUrl).hostname
  } catch {
    // keep fallback host
  }

  return `notifications@${host}`
}

/**
 * Lexical children describing how to reach the dedicated incident channel.
 * Renders the real phone/email once set; otherwise a truthful interim
 * sentence. Used on the notice, contact, and FAQ pages.
 */
export const contactChannelNodes = (): LexicalNode[] => {
  const phone = hasPhone()
  const email = hasEmail()

  if (phone || email) {
    const children: LexicalNode[] = []
    if (phone) {
      children.push(text('Telephone: '), bold(INCIDENT.phone))
    }
    if (phone && email) {
      children.push(text(' — '))
    }
    if (email) {
      children.push(link(emailHref(), EMAIL_LINK_LABEL))
    }
    return children
  }

  return [
    text(
      'A dedicated telephone line and email address for this incident are being established and will be posted here. In the meantime, you may reach the incident response administrator through the ',
    ),
    link('/contact', 'contact page'),
    text('.'),
  ]
}

/** Inline sentence naming the incident contact channel, for prose. */
export const contactChannelSentence = (): LexicalNode[] => {
  const phone = hasPhone()
  const email = hasEmail()

  if (phone && email) {
    return [
      text('Call the dedicated incident line at '),
      bold(INCIDENT.phone),
      text(', '),
      link(emailHref(), EMAIL_LINK_LABEL),
      text(', or use the '),
      link('/contact', 'contact page'),
      text('.'),
    ]
  }
  if (phone) {
    return [
      text('Call the dedicated incident line at '),
      bold(INCIDENT.phone),
      text(' or use the '),
      link('/contact', 'contact page'),
      text('.'),
    ]
  }
  if (email) {
    return [
      link(emailHref(), EMAIL_LINK_LABEL),
      text(' or use the '),
      link('/contact', 'contact page'),
      text('.'),
    ]
  }
  return [
    text('A dedicated incident line and email are being established. In the meantime, use the '),
    link('/contact', 'contact page'),
    text('.'),
  ]
}
