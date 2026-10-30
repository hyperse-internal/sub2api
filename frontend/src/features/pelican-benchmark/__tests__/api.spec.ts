import { describe, expect, it } from 'vitest'
import { pelicanDocumentUrl, resolvePelicanProxyUrl, teamoUrl } from '../api'

describe('pelican-benchmark api helpers', () => {
  it('builds same-origin backend proxy urls', () => {
    expect(teamoUrl('/api/v1/pelican-benchmark')).toBe('/teamo/api/v1/pelican-benchmark')
  })

  it('rewrites relative document urls to /teamo', () => {
    expect(
      resolvePelicanProxyUrl('/api/v1/pelican-benchmark/abc/document.html?attempt=1')
    ).toBe('/teamo/api/v1/pelican-benchmark/abc/document.html?attempt=1')
  })

  it('rewrites absolute teamorouter urls to /teamo', () => {
    expect(
      resolvePelicanProxyUrl(
        'https://teamorouter.com/api/v1/pelican-benchmark/abc/document.html?attempt=1'
      )
    ).toBe('/teamo/api/v1/pelican-benchmark/abc/document.html?attempt=1')
  })

  it('builds document url from item fields via backend proxy', () => {
    expect(
      pelicanDocumentUrl({
        id: 'dff4172f',
        attempt: 1,
        documentUrl: null
      })
    ).toBe('/teamo/api/v1/pelican-benchmark/dff4172f/document.html?attempt=1')
  })
})
