/**
 * Small builders for Lexical richText seed data, so content files stay
 * readable instead of hand-writing deeply nested editor state JSON.
 */

export type LexicalNode = {
  [k: string]: unknown
  type: string
  version: number
}

export type LexicalRichText = {
  [k: string]: unknown
  root: {
    [k: string]: unknown
    children: LexicalNode[]
    direction: 'ltr' | 'rtl' | null
    format: '' | 'center' | 'end' | 'justify' | 'left' | 'right' | 'start'
    indent: number
    type: string
    version: number
  }
}

export const text = (t: string, format: number = 0): LexicalNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})

export const bold = (t: string): LexicalNode => text(t, 1)

export const link = (url: string, label: string, newTab: boolean = false): LexicalNode => ({
  type: 'link',
  children: [text(label)],
  direction: 'ltr',
  fields: {
    linkType: 'custom',
    newTab,
    url,
  },
  format: '',
  indent: 0,
  version: 2,
})

export const paragraph = (...children: LexicalNode[]): LexicalNode => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const heading = (
  tag: 'h1' | 'h2' | 'h3' | 'h4',
  ...children: LexicalNode[]
): LexicalNode => ({
  type: 'heading',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

export const root = (...children: LexicalNode[]): LexicalRichText => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})
