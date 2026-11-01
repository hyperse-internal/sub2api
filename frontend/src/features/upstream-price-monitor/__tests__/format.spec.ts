import { describe, expect, it } from 'vitest'
import {
  defaultSyncProfitPct,
  formatLocalWithMargin,
  formatMargin,
  formatPrice,
  formatSuggestedSellRange,
  impliedMargin,
  percentToRatio
} from '../format'

describe('upstream-price-monitor format', () => {
  it('formats prices', () => {
    expect(formatPrice(0.2443)).toBe('0.2443')
    expect(formatPrice(null)).toBe('—')
  })

  it('formats margins', () => {
    expect(formatMargin(0.3)).toBe('30.00%')
    expect(formatMargin(undefined)).toBe('—')
  })

  it('computes implied margin and local display', () => {
    expect(impliedMargin(0.171, 0.244)).toBeCloseTo(0.29918, 4)
    expect(formatLocalWithMargin(1.53, 1.07)).toBe('1.5300 (30.07%)')
    expect(formatLocalWithMargin(null, 1.07)).toBe('—')
  })

  it('formats suggested sell range from profit band', () => {
    // 0.171 / (1-0.25) = 0.228, 0.171 / (1-0.35) = 0.263076...
    expect(formatSuggestedSellRange(0.171, 0.25, 0.35)).toBe('[0.2280, 0.2631]')
    expect(formatSuggestedSellRange(null, 0.25, 0.35)).toBe('—')
  })

  it('converts percent to ratio', () => {
    expect(percentToRatio(30)).toBe(0.3)
  })

  it('defaults sync profit to midpoint with 1 decimal', () => {
    expect(defaultSyncProfitPct(0.25, 0.35)).toBe(30)
    expect(defaultSyncProfitPct(0.2, 0.33)).toBe(26.5)
  })
})
