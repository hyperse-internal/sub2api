import { apiClient } from '../client'
import type { PaginatedResponse } from '@/types'

export type UpstreamPriceMonitorRunStatus = 'running' | 'passed' | 'failed' | 'error'
export type UpstreamPriceMonitorItemStatus =
  | 'pass'
  | 'fail'
  | 'unmatched_upstream'
  | 'unmatched_local'
  | 'skipped'

export interface UpstreamPriceMonitorConfig {
  enabled: boolean
  interval_seconds: number
  channel_ids: number[]
  notify_emails: string[]
  profit_min: number
  profit_max: number
  target_profit: number | null
  last_run_at: string | null
  updated_by: number | null
  updated_at: string
}

export interface UpstreamPriceMonitorConfigUpdate {
  enabled?: boolean
  interval_seconds?: number
  channel_ids?: number[]
  notify_emails?: string[]
  profit_min?: number
  profit_max?: number
  target_profit?: number | null
  clear_target?: boolean
}

export interface UpstreamPriceMonitorRunItem {
  id: number
  channel_id: number
  channel_name: string
  model: string
  status: UpstreamPriceMonitorItemStatus
  upstream_input: number | null
  upstream_output: number | null
  upstream_cache_read: number | null
  upstream_cache_write: number | null
  local_input: number | null
  local_output: number | null
  local_cache_read: number | null
  local_cache_write: number | null
  suggested_input: number | null
  suggested_output: number | null
  suggested_cache_read: number | null
  suggested_cache_write: number | null
  margin_input: number | null
  message: string
}

export interface UpstreamPriceMonitorRun {
  id: number
  status: UpstreamPriceMonitorRunStatus
  started_at: string
  finished_at: string | null
  upstream_fetched_at: string | null
  model_count: number
  matched_count: number
  out_of_range_count: number
  summary: string
  error_message: string | null
  channel_ids: number[]
  profit_min: number
  profit_max: number
  target_profit: number | null
  items?: UpstreamPriceMonitorRunItem[]
}

const BASE = '/admin/upstream-price-monitor'

export async function getConfig(): Promise<UpstreamPriceMonitorConfig> {
  const { data } = await apiClient.get<UpstreamPriceMonitorConfig>(`${BASE}/config`)
  return data
}

export async function updateConfig(
  body: UpstreamPriceMonitorConfigUpdate
): Promise<UpstreamPriceMonitorConfig> {
  const { data } = await apiClient.put<UpstreamPriceMonitorConfig>(`${BASE}/config`, body)
  return data
}

export async function runNow(): Promise<UpstreamPriceMonitorRun> {
  const { data } = await apiClient.post<UpstreamPriceMonitorRun>(`${BASE}/run`)
  return data
}

export async function listRuns(
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<UpstreamPriceMonitorRun>> {
  const { data } = await apiClient.get<PaginatedResponse<UpstreamPriceMonitorRun>>(`${BASE}/runs`, {
    params: { page, page_size: pageSize }
  })
  return data
}

export async function getRun(id: number): Promise<UpstreamPriceMonitorRun> {
  const { data } = await apiClient.get<UpstreamPriceMonitorRun>(`${BASE}/runs/${id}`)
  return data
}

export async function deleteRun(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/runs/${id}`)
}

export interface SyncChannelModelPriceRequest {
  channel_id: number
  model: string
  /** Gross margin ratio in (0, 1). */
  profit: number
}

export interface SyncChannelModelPriceResult {
  channel_id: number
  model: string
  profit: number
  input: number
  output: number
  cache_read?: number | null
  cache_write?: number | null
  local_input: number
  local_output: number
  local_cache_read?: number | null
  local_cache_write?: number | null
}

/** Apply sell = upstream / (1 - profit) onto the channel model pricing. */
export async function syncPrice(
  body: SyncChannelModelPriceRequest
): Promise<SyncChannelModelPriceResult> {
  const { data } = await apiClient.post<SyncChannelModelPriceResult>(`${BASE}/sync-price`, body)
  return data
}
