import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'

export const FAQBlock: React.FC<FAQBlockProps> = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="container">
      <div className="max-w-[48rem] mx-auto flex flex-col gap-4">
        {items.map((item, index) => (
          <details
            className="group border border-border rounded-lg bg-card"
            key={item.id ?? index}
          >
            <summary className="cursor-pointer list-none p-4 font-semibold flex items-center justify-between gap-4">
              {item.question}
              <span aria-hidden className="transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <div className="px-4 pb-4">
              <RichText data={item.answer} enableGutter={false} />
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
