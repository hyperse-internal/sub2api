/**
 * Redeem code API endpoints
 * Handles redeem code redemption for users
 */

import { apiClient } from './client'
import type { PaginatedResponse, RedeemCode, RedeemCodeRequest } from '@/types'

export interface RedeemHistoryItem {
  id: number
  code: string
  type: string
  value: number
  status: string
  used_at: string
  created_at: string
  // Notes from admin for admin_balance/admin_concurrency types
  notes?: string
  // Subscription-specific fields
  group_id?: number
  validity_days?: number
  group?: {
    id: number
    name: string
  }
}

export type RedeemPreview = Pick<
  RedeemCode,
  'id' | 'code' | 'type' | 'value' | 'status' | 'group_id' | 'validity_days' | 'group' | 'expires_at'
>

/**
 * Preview a redeem code without consuming it
 * @param code - Redeem code string
 */
export async function preview(code: string): Promise<RedeemPreview> {
  const payload: RedeemCodeRequest = { code }
  const { data } = await apiClient.post<RedeemPreview>('/redeem/preview', payload)
  return data
}

/**
 * Redeem a code
 * @param code - Redeem code string
 * @returns Redemption result with updated balance or concurrency
 */
export async function redeem(code: string): Promise<{
  message: string
  type: string
  value: number
  new_balance?: number
  new_concurrency?: number
  group_name?: string
  validity_days?: number
}> {
  const payload: RedeemCodeRequest = { code }

  const { data } = await apiClient.post<{
    message: string
    type: string
    value: number
    new_balance?: number
    new_concurrency?: number
    group_name?: string
    validity_days?: number
  }>('/redeem', payload)

  return data
}

/**
 * Get user's redemption history
 * @returns The requested page of redeemed codes and the total count
 */
export async function getHistory(page = 1, pageSize = 20): Promise<PaginatedResponse<RedeemHistoryItem>> {
  const { data } = await apiClient.get<PaginatedResponse<RedeemHistoryItem>>('/redeem/history', {
    params: { page, page_size: pageSize }
  })
  return data
}

export const redeemAPI = {
  preview,
  redeem,
  getHistory
}

export default redeemAPI
