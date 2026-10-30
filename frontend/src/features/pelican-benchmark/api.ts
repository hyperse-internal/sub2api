/**
 * 鹈鹕测智：前端只请求本后端 `/teamo` 同源反代，由 Go 转发 TeamoRouter。
 */
import type { FetchPelicanBenchmarkParams, PelicanBenchmarkItem, PelicanBenchmarkResponse } from './types'

/** 本后端反代前缀（见 backend routes.RegisterTeamoProxyRoutes） */
export const TEAMO_PROXY_PREFIX = '/teamo'

const LIST_PATH = '/api/v1/pelican-benchmark'

export function teamoUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${TEAMO_PROXY_PREFIX}${normalized}`
}

/** 将接口返回的相对/绝对 document URL 统一成同源 `/teamo/...` */
export function resolvePelicanProxyUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const u = new URL(pathOrUrl)
      if (u.hostname === 'teamorouter.com' || u.hostname.endsWith('.teamorouter.com')) {
        return teamoUrl(`${u.pathname}${u.search}`)
      }
      return pathOrUrl
    } catch {
      return pathOrUrl
    }
  }
  return teamoUrl(pathOrUrl)
}

export function pelicanDocumentUrl(item: Pick<PelicanBenchmarkItem, 'id' | 'attempt' | 'documentUrl'>): string | null {
  if (item.documentUrl) return resolvePelicanProxyUrl(item.documentUrl)
  if (!item.id) return null
  return teamoUrl(`${LIST_PATH}/${encodeURIComponent(item.id)}/document.html?attempt=${item.attempt || 1}`)
}

export async function fetchPelicanBenchmark(
  params: FetchPelicanBenchmarkParams = {}
): Promise<PelicanBenchmarkResponse> {
  const search = new URLSearchParams()
  search.set('limit', String(params.limit ?? 20))
  if (params.model) search.set('model', params.model)
  if (params.before) search.set('before', params.before)

  const response = await fetch(`${teamoUrl(LIST_PATH)}?${search}`, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
    signal: params.signal
  })

  if (!response.ok) {
    throw new Error(`pelican_unavailable:${response.status}`)
  }

  return (await response.json()) as PelicanBenchmarkResponse
}

export async function downloadPelicanHtml(item: PelicanBenchmarkItem, filename?: string): Promise<void> {
  const url = pelicanDocumentUrl(item)
  if (!url) throw new Error('pelican_no_document')

  const response = await fetch(url, { cache: 'no-store', credentials: 'omit' })
  if (!response.ok) throw new Error(`pelican_download_failed:${response.status}`)

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename || `${item.model}-${item.id.slice(0, 8)}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
