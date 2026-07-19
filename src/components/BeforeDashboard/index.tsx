import React from 'react'

import { SeedButton } from './SeedButton'

/**
 * Rendered at the top of the admin dashboard. Gives a one-click way to populate
 * a fresh database with the starter content (pages, investigation updates,
 * contact form, header/footer nav) instead of hitting the `/next/seed` endpoint
 * by hand.
 */
const BeforeDashboard: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ marginBottom: '0.5rem' }}>Set up your site</h4>
      <p style={{ marginTop: 0, marginBottom: '1rem', maxWidth: '40rem' }}>
        Seed the initial content — pages, investigation updates, the contact form, and the
        header/footer navigation. You can edit or replace everything afterward. Re-running the seed
        replaces the seeded content, so avoid it once you&apos;ve started customizing.
      </p>
      <SeedButton />
    </div>
  )
}

export default BeforeDashboard
