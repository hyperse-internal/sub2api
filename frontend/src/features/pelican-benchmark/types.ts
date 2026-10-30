/** 鹈鹕测智响应类型（经本后端 /teamo 反代 TeamoRouter pelican-benchmark） */

export type PelicanBenchmarkStatus = 'queued' | 'running' | 'failed' | 'succeeded' | string

export interface PelicanBenchmarkItem {
  id: string
  model: string
  promptVersion: number
  scheduledAt: string
  startedAt: string | null
  finishedAt: string | null
  durationMs: number | null
  status: PelicanBenchmarkStatus
  attempt: number
  failureCode: string | null
  disqualified: boolean
  imageUrl: string | null
  documentUrl: string | null
  sourceFormat: string
  width: number
  height: number
}

export interface PelicanBenchmarkGroup {
  model: string
  items: PelicanBenchmarkItem[]
  nextBefore: string | null
}

export interface PelicanBenchmarkResponse {
  prompt: string
  promptVersion: number
  intervalMinutes: number
  timezone: string
  enabled: boolean
  enabledModels: string[]
  groups: PelicanBenchmarkGroup[]
}

export interface FetchPelicanBenchmarkParams {
  limit?: number
  model?: string
  before?: string
  signal?: AbortSignal
}
