import { describe, expect, it } from 'vitest'
import { FALLBACK_DOCS_URL, resolveDocsUrl } from '../docsUrl'

describe('resolveDocsUrl', () => {
  it('falls back to same-origin /docs when empty', () => {
    expect(resolveDocsUrl('')).toBe(FALLBACK_DOCS_URL)
    expect(resolveDocsUrl(null)).toBe(FALLBACK_DOCS_URL)
  })

  it('uses configured absolute doc_url', () => {
    expect(resolveDocsUrl('https://docs.example.com/guide')).toBe('https://docs.example.com/guide')
  })

  it('appends slug pages', () => {
    expect(resolveDocsUrl('/docs', 'config-tool')).toBe('/docs/config-tool')
    expect(resolveDocsUrl('https://ai.alphaio.vip/docs', 'config-tool')).toBe(
      'https://ai.alphaio.vip/docs/config-tool'
    )
  })

  it('prefixes /cn for zh locales on /docs paths', () => {
    expect(resolveDocsUrl('/docs', '', 'zh')).toBe('/cn/docs')
    expect(resolveDocsUrl('/docs', 'faq', 'zh')).toBe('/cn/docs/faq')
    expect(resolveDocsUrl('https://ai.alphaio.vip/docs', '', 'zh')).toBe(
      'https://ai.alphaio.vip/cn/docs'
    )
  })

  it('rejects unsafe schemes', () => {
    expect(resolveDocsUrl('javascript:alert(1)')).toBe(FALLBACK_DOCS_URL)
  })
})
