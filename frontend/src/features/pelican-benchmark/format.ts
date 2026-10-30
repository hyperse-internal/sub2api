import type { PelicanBenchmarkItem, PelicanBenchmarkStatus } from './types'

const SHANGHAI_TZ = 'Asia/Shanghai'

export function formatPelicanDateTime(iso: string | null | undefined, locale = 'zh-CN'): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: SHANGHAI_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
      .format(date)
      .replace(/\//g, '/')
  } catch {
    return date.toISOString()
  }
}

export function formatPelicanDuration(durationMs: number | null | undefined): string | null {
  if (durationMs == null || !Number.isFinite(durationMs) || durationMs < 0) return null
  const seconds = durationMs / 1000
  if (seconds < 10) return `${seconds.toFixed(1)}`
  if (seconds < 100) return `${seconds.toFixed(1)}`
  return `${seconds.toFixed(1)}`
}

export function pelicanStatusTone(
  status: PelicanBenchmarkStatus,
  disqualified: boolean
): 'success' | 'danger' | 'warning' | 'muted' {
  if (disqualified || status === 'failed') return 'danger'
  if (status === 'succeeded') return 'success'
  if (status === 'running' || status === 'queued') return 'warning'
  return 'muted'
}

export function pelicanPreviewSize(item: Pick<PelicanBenchmarkItem, 'width' | 'height'>): {
  width: number
  height: number
} {
  const width = item.width > 0 ? item.width : 800
  const height = item.height > 0 ? item.height : 500
  return { width, height }
}
