import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const headerSource = readFileSync(resolve(dir, '../AppHeader.vue'), 'utf8')
const homeViewSource = readFileSync(resolve(dir, '../../../views/HomeView.vue'), 'utf8')
const keyUsageViewSource = readFileSync(resolve(dir, '../../../views/KeyUsageView.vue'), 'utf8')
const docsRedirectSource = readFileSync(
  resolve(dir, '../../../views/docs/DocsRedirectView.vue'),
  'utf8'
)

describe('docs entry', () => {
  it('AppHeader links to the external docs URL helper', () => {
    expect(headerSource).toContain("import { resolveDocsUrl } from '@/utils/docsUrl'")
    expect(headerSource).toContain(':href="docsUrl"')
  })

  it('HomeView sanitizes the site logo and links to external docs', () => {
    expect(homeViewSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(homeViewSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
    expect(homeViewSource).toContain("import { resolveDocsUrl } from '@/utils/docsUrl'")
    expect(homeViewSource).toContain(':href="docsUrl"')
  })

  it('KeyUsageView sanitizes the site logo and links to external docs', () => {
    expect(keyUsageViewSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(keyUsageViewSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
    expect(keyUsageViewSource).toContain("import { resolveDocsUrl } from '@/utils/docsUrl'")
    expect(keyUsageViewSource).toContain(':href="docsUrl"')
  })

  it('legacy /docs route redirects via DocsRedirectView', () => {
    expect(docsRedirectSource).toContain('resolveDocsUrl')
    expect(docsRedirectSource).toContain('window.location.replace')
  })
})
