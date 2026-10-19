import { Marked, type Tokens } from 'marked'
import DOMPurify from 'dompurify'

export type DocHeading = {
  id: string
  text: string
  depth: number
}

export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[*_~[\]()`]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function uniqueHeadingId(text: string, counts: Map<string, number>): string {
  const base = slugifyHeading(text) || 'section'
  const count = counts.get(base) ?? 0
  counts.set(base, count + 1)
  return count === 0 ? base : `${base}-${count}`
}

function flattenTokenText(token: { text?: string; tokens?: Array<{ text?: string; raw?: string }> }): string {
  if (token.tokens?.length) return token.tokens.map((item) => item.text ?? item.raw ?? '').join('')
  return token.text ?? ''
}

export function extractMarkdownHeadings(markdown: string, maxDepth = 3): DocHeading[] {
  const tokens = new Marked().lexer(markdown)
  const counts = new Map<string, number>()
  const headings: DocHeading[] = []
  for (const token of tokens) {
    if (token.type !== 'heading' || token.depth > maxDepth) continue
    const text = flattenTokenText(token).trim()
    if (!text) continue
    headings.push({ id: uniqueHeadingId(text, counts), text, depth: token.depth })
  }
  return headings
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderDocsMarkdown(markdown: string): string {
  const counts = new Map<string, number>()
  const parser = new Marked({ gfm: true, breaks: false })
  parser.use({
    renderer: {
      heading(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens)
        const text = html.replace(/<[^>]+>/g, '').trim()
        const id = uniqueHeadingId(text, counts)
        return `<h${depth} id="${escapeHtml(id)}">${html}</h${depth}>\n`
      },
      link(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { href, title, tokens }: Tokens.Link) {
        const html = this.parser.parseInline(tokens)
        const safeHref = href ?? ''
        const external = /^https?:/i.test(safeHref)
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
        const extra = external ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${escapeHtml(safeHref)}"${titleAttr}${extra}>${html}</a>`
      }
    }
  })
  const html = parser.parse(markdown, { async: false }) as string
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
}
