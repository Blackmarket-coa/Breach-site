'use client'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp'
const MAX_FILE_BYTES = 4 * 1024 * 1024

export const RequestInformationForm: React.FC = () => {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    const file = data.get('document')
    if (file && typeof file !== 'string' && file.size > MAX_FILE_BYTES) {
      setError('The attached file is too large. Please keep uploads under 4 MB.')
      return
    }

    if (turnstileToken) {
      data.set('cfTurnstileToken', turnstileToken)
    }

    setSubmitting(true)
    try {
      const res = await fetch('/next/request-information', { method: 'POST', body: data })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(body.error || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
      formEl.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      // Turnstile tokens are single-use — reset for a retry.
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-border bg-card p-6">
        <h2 className="mb-2 text-xl font-semibold">Your request has been received.</h2>
        <p className="text-muted-foreground">
          Thank you. If you provided an email address, someone reviewing incident inquiries may
          contact you. Please do not send additional sensitive personal information by email.
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} ref={formRef}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="name">
          Full name <span className="text-destructive">*</span>
        </label>
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Phone <span className="text-destructive">*</span>
        </label>
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="topic">
          How can we help?
        </label>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          id="topic"
          name="topic"
          defaultValue="general"
        >
          <option value="general">General information request</option>
          <option value="affected-client">I believe I am an affected prior client</option>
          <option value="crypto-solicitation">Report a related crypto solicitation</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="message">
          Message <span className="text-destructive">*</span>
        </label>
        <p className="text-sm text-muted-foreground">
          Please describe your request, your connection to the business, and any supporting
          documentation you can provide (you can also attach a file below).
        </p>
        <textarea
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          id="message"
          name="message"
          required
          rows={5}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="document">
          Supporting document <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          accept={ACCEPT}
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          id="document"
          name="document"
          type="file"
        />
        <p className="text-sm text-muted-foreground">
          PDF, JPG, PNG, or WebP, up to 4 MB. Your file is stored privately and is not shown on
          this website. Please do <strong>not</strong> upload documents containing your full Social
          Security number or full financial account numbers.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {turnstileSiteKey && (
        <Turnstile
          className="mb-2"
          onError={() => setTurnstileToken(null)}
          onExpire={() => setTurnstileToken(null)}
          onSuccess={setTurnstileToken}
          options={{ theme: 'auto' }}
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
        />
      )}

      <Button
        className="self-start"
        disabled={submitting || (Boolean(turnstileSiteKey) && !turnstileToken)}
        type="submit"
        variant="default"
      >
        {submitting ? 'Submitting…' : 'Submit request'}
      </Button>
    </form>
  )
}
