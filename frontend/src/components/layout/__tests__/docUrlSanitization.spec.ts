import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const headerSource = readFileSync(resolve(dir, '../AppHeader.vue'), 'utf8')
const homeViewSource = readFileSync(resolve(dir, '../../../views/HomeView.vue'), 'utf8')
const keyUsageViewSource = readFileSync(resolve(dir, '../../../views/KeyUsageView.vue'), 'utf8')

describe('docs entry', () => {
  it('AppHeader opens the in-app docs center', () => {
    expect(headerSource).toContain('to="/docs"')
  })

  it('HomeView sanitizes the site logo and links to the in-app docs', () => {
    expect(homeViewSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(homeViewSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
    expect(homeViewSource).toContain('to="/docs"')
  })

  it('KeyUsageView sanitizes the site logo and links to the in-app docs', () => {
    expect(keyUsageViewSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(keyUsageViewSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
    expect(keyUsageViewSource).toContain('to="/docs"')
  })
})
