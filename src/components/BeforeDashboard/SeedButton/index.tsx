'use client'

import { Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'

/**
 * Triggers the authenticated `/next/seed` endpoint from inside the admin panel.
 * Running here means the request carries the admin session cookie automatically,
 * so there's no console/cookie juggling. On failure it surfaces the real error
 * text returned by the endpoint (e.g. media-storage misconfiguration).
 */
export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const router = useRouter()

  const handleClick = useCallback(async () => {
    if (loading || seeded) return
    setLoading(true)
    try {
      const res = await fetch('/next/seed', { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        throw new Error((await res.text()) || `Request failed (${res.status})`)
      }
      setSeeded(true)
      toast.success('Database seeded — your content is ready. Reloading…')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Seeding failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }, [loading, seeded, router])

  return (
    <Button buttonStyle="primary" disabled={loading || seeded} onClick={handleClick}>
      {seeded ? 'Database seeded' : loading ? 'Seeding…' : 'Seed your database'}
    </Button>
  )
}
