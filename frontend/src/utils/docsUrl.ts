import { sanitizeUrl } from '@/utils/url'

/** Same-origin docs SPA embedded in the backend binary (`website/` → `/docs`). */
export const FALLBACK_DOCS_URL = '/docs'

/**
 * Resolve the public docs URL.
 * - Uses configured `doc_url` when set (absolute http/https)
 * - Otherwise uses same-origin `/docs` (embedded fumadocs site)
 * - Optional `slug` appends a page path (e.g. `config-tool`)
 * - For zh locales, prefixes `/cn` on `/docs` paths
 */
export function resolveDocsUrl(
  docUrl?: string | null,
  slug = '',
  locale?: string
): string {
  const configured = sanitizeUrl((docUrl || '').trim())
  let base = configured || FALLBACK_DOCS_URL

  const isZh = locale === 'zh' || locale === 'zh-CN' || locale === 'cn'
  if (isZh) {
    if (base.startsWith('/')) {
      if (base === '/docs' || base.startsWith('/docs/')) {
        base = `/cn${base}`
      }
    } else {
      try {
        const url = new URL(base)
        if (!url.pathname.startsWith('/cn')) {
          if (url.pathname === '/docs' || url.pathname.startsWith('/docs/')) {
            url.pathname = `/cn${url.pathname}`
            base = url.toString().replace(/\/$/, '')
          } else if (url.pathname === '/' || url.pathname === '') {
            url.pathname = '/cn/docs'
            base = url.toString().replace(/\/$/, '')
          }
        }
      } catch {
        // keep base as-is
      }
    }
  }

  const normalized = base.replace(/\/$/, '')
  const page = slug.replace(/^\/+/, '').trim()
  if (!page) return normalized
  return `${normalized}/${page}`
}
