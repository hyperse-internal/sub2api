/**
 * Admin consumption report API — per-user spend at grain: user + model + date (max 7 days).
 */

import { apiClient } from '@/api/client'
import type { SimpleUser } from '@/api/admin/usage'
import { searchUsers as adminSearchUsers } from '@/api/admin/usage'

export interface ConsumptionReportUser {
  id: number
  email: string
  deleted: boolean
}

export interface ConsumptionReportSummary {
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_creation_tokens: number
  total_cache_read_tokens: number
  total_tokens: number
  total_cost: number
  total_actual_cost: number
  average_duration_ms: number
  avg_rate_multiplier: number
}

export interface ConsumptionDailyRow {
  date: string
  model: string
  requests: number
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface ConsumptionModelStat {
  model: string
  requests: number
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  total_tokens: number
  cost: number
  actual_cost: number
  account_cost?: number
}

export interface ConsumptionReport {
  user: ConsumptionReportUser
  start_date: string
  end_date: string
  timezone: string
  model?: string
  summary: ConsumptionReportSummary
  daily: ConsumptionDailyRow[]
  models: ConsumptionModelStat[]
}

export interface ConsumptionReportQuery {
  user_id: number
  start_date: string
  end_date: string
  timezone?: string
  model?: string
}

export async function getConsumptionReport(
  params: ConsumptionReportQuery,
  options?: { signal?: AbortSignal }
): Promise<ConsumptionReport> {
  const { data } = await apiClient.get<ConsumptionReport>('/admin/usage/consumption-report', {
    params,
    signal: options?.signal
  })
  return data
}

export async function searchUsers(keyword: string): Promise<SimpleUser[]> {
  return adminSearchUsers(keyword)
}

export type { SimpleUser }
