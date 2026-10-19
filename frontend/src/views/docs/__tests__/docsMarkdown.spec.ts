import { describe, expect, it } from 'vitest'
import { loadDoc } from '../docsConfig'
import { extractMarkdownHeadings, renderDocsMarkdown } from '../docsMarkdown'

describe('docs markdown', () => {
  it('loads frontmatter and keeps heading ids in the rendered html', () => {
    const doc = loadDoc('register')
    expect(doc?.frontmatter.title).toBe('注册账号')
    const headings = extractMarkdownHeadings(doc?.body ?? '')
    expect(headings.map((item) => item.text)).toEqual(['注册', '登录', '下一步'])
    const html = renderDocsMarkdown(doc?.body ?? '')
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`)
    }
    expect(html).toContain('href="?doc=purchase"')
  })
})
