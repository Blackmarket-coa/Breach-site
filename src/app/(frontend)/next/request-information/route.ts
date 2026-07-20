import { createLocalReq } from 'payload'

import { getPayloadClient } from '@/utilities/getPayloadClient'
import { verifyTurnstile } from '@/utilities/verifyTurnstile'

export const maxDuration = 60

const MAX_FIELD_LENGTH = 5000
const MAX_FILE_BYTES = 4 * 1024 * 1024 // 4 MB — stays under Vercel's request body cap
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])

const str = (v: FormDataEntryValue | null): string =>
  typeof v === 'string' ? v.trim() : ''

const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export async function POST(request: Request): Promise<Response> {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return Response.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const name = str(form.get('name')).slice(0, MAX_FIELD_LENGTH)
  const email = str(form.get('email')).slice(0, MAX_FIELD_LENGTH)
  const phone = str(form.get('phone')).slice(0, MAX_FIELD_LENGTH)
  const message = str(form.get('message')).slice(0, MAX_FIELD_LENGTH)
  const TOPICS = ['general', 'affected-client', 'crypto-solicitation'] as const
  type Topic = (typeof TOPICS)[number]
  const topicRaw = str(form.get('topic'))
  const topic: Topic = (TOPICS as readonly string[]).includes(topicRaw)
    ? (topicRaw as Topic)
    : 'general'
  const token = str(form.get('cfTurnstileToken')) || undefined

  if (!name) {
    return Response.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!email || !isEmail(email)) {
    return Response.json(
      { error: 'A valid email address is required so we can respond to you.' },
      { status: 400 },
    )
  }
  if (!phone) {
    return Response.json({ error: 'Please enter a phone number.' }, { status: 400 })
  }
  if (!message) {
    return Response.json(
      { error: 'Please describe your request in the message field.' },
      { status: 400 },
    )
  }

  const remoteip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined

  const verification = await verifyTurnstile(token, { remoteip })
  if (!verification.ok) {
    return Response.json(
      { error: 'Human verification failed. Please try again.' },
      { status: 400 },
    )
  }

  // Validate the optional upload before touching the database.
  const upload = form.get('document')
  let fileBuffer: Buffer | undefined
  let fileName: string | undefined
  let fileType: string | undefined
  if (upload && typeof upload !== 'string' && upload.size > 0) {
    // Never accept a file we can't store privately. In production without a
    // private bucket the file would be lost (or worse, land somewhere public),
    // so reject rather than silently drop it.
    if (process.env.VERCEL && !process.env.S3_PRIVATE_BUCKET) {
      return Response.json(
        {
          error:
            'File uploads are not enabled yet. Please submit your request without an attachment; we will follow up about how to send documents securely.',
        },
        { status: 400 },
      )
    }
    if (upload.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: 'The attached file is too large. Please keep uploads under 4 MB.' },
        { status: 400 },
      )
    }
    if (!ALLOWED_MIME.has(upload.type)) {
      return Response.json(
        { error: 'Unsupported file type. Please upload a PDF, JPG, PNG, or WebP.' },
        { status: 400 },
      )
    }
    fileBuffer = Buffer.from(await upload.arrayBuffer())
    fileName = upload.name || 'upload'
    fileType = upload.type
  }

  try {
    const payload = await getPayloadClient()
    // A system request with overrideAccess so the public can submit without any
    // read/create access to these admin-only collections.
    const req = await createLocalReq({}, payload)

    let documentId: number | undefined
    if (fileBuffer && fileName && fileType) {
      const doc = await payload.create({
        collection: 'request-documents',
        data: { submitterNote: `Uploaded with request from ${email}` },
        file: { name: fileName, data: fileBuffer, mimetype: fileType, size: fileBuffer.byteLength },
        overrideAccess: true,
        req,
      })
      documentId = doc.id as number
    }

    await payload.create({
      collection: 'information-requests',
      data: {
        name,
        email,
        phone,
        message,
        topic,
        status: 'new',
        ...(documentId ? { document: documentId } : {}),
      },
      overrideAccess: true,
      req,
    })

    return Response.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return Response.json({ error: `Could not submit your request: ${message}` }, { status: 500 })
  }
}
