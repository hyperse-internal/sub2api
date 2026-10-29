import { describe, expect, it } from 'vitest'
import type { PlazaModel } from '@/api/modelPlaza'
import {
  buildGroupPricingHint,
  formatRelativeRateRange,
  summarizeGroupRelativeRate,
  vsOfficialWithRate
} from '../relativeOfficialRate'

function tokenModel(overrides: Partial<PlazaModel> = {}): PlazaModel {
  return {
    name: 'model',
    platform: 'openai',
    pricing: {
      billing_mode: 'token',
      input_price: 3e-6,
      output_price: 1.5e-5,
      cache_write_price: null,
      cache_read_price: null,
      image_input_price: null,
      image_output_price: null,
      per_request_price: null,
      intervals: []
    },
    official_pricing: {
      input_price: 1e-5,
      output_price: 5e-5,
      cache_write_price: null,
      cache_read_price: null
    },
    ...overrides
  }
}

describe('vsOfficialWithRate', () => {
  it('渠道绝对售价 + 分组 1.0 → 相对官价', () => {
    // 3.06e-6 / 1e-5 = 0.306 → 0.3
    expect(vsOfficialWithRate(tokenModel({
      pricing: {
        billing_mode: 'token',
        input_price: 3.06e-6,
        output_price: 1.53e-5,
        cache_write_price: null,
        cache_read_price: null,
        image_input_price: null,
        image_output_price: null,
        per_request_price: null,
        intervals: []
      }
    }), 1)).toBe(0.3)
  })

  it('专属倍率替换分组倍率', () => {
    // (3e-6 * 0.5) / 1e-5 = 0.15 → 0.2
    expect(vsOfficialWithRate(tokenModel(), 0.5)).toBe(0.2)
  })

  it('无官价返回 null', () => {
    expect(vsOfficialWithRate(tokenModel({ official_pricing: null }), 1)).toBeNull()
  })
})

describe('summarizeGroupRelativeRate', () => {
  it('聚合 min/max', () => {
    const models = [
      tokenModel({
        name: 'a',
        pricing: {
          billing_mode: 'token',
          input_price: 1e-6,
          output_price: 1e-6,
          cache_write_price: null,
          cache_read_price: null,
          image_input_price: null,
          image_output_price: null,
          per_request_price: null,
          intervals: []
        },
        official_pricing: {
          input_price: 1e-5,
          output_price: 1e-5,
          cache_write_price: null,
          cache_read_price: null
        }
      }),
      tokenModel({
        name: 'b',
        pricing: {
          billing_mode: 'token',
          input_price: 7e-6,
          output_price: 1e-6,
          cache_write_price: null,
          cache_read_price: null,
          image_input_price: null,
          image_output_price: null,
          per_request_price: null,
          intervals: []
        },
        official_pricing: {
          input_price: 1e-5,
          output_price: 1e-5,
          cache_write_price: null,
          cache_read_price: null
        }
      })
    ]
    // 0.1 与 0.7
    expect(summarizeGroupRelativeRate(models, 1)).toEqual({ min: 0.1, max: 0.7 })
  })

  it('全部无官价返回 null', () => {
    expect(summarizeGroupRelativeRate([tokenModel({ official_pricing: null })], 1)).toBeNull()
  })
})

describe('formatRelativeRateRange', () => {
  it('单值与区间', () => {
    expect(formatRelativeRateRange({ min: 0.3, max: 0.3 })).toBe('0.3x')
    expect(formatRelativeRateRange({ min: 0.1, max: 0.7 })).toBe('0.1x–0.7x')
  })
})

describe('buildGroupPricingHint', () => {
  it('有相对官价 → relative', () => {
    const hint = buildGroupPricingHint({
      models: [tokenModel()],
      rateMultiplier: 1
    })
    expect(hint.mode).toBe('relative')
    expect(hint.relativeRange).toEqual({ min: 0.3, max: 0.3 })
    expect(hint.showSecondaryGroupRate).toBe(false)
  })

  it('专属倍率划线展示分组默认区间', () => {
    const hint = buildGroupPricingHint({
      models: [tokenModel()],
      rateMultiplier: 1,
      userRateMultiplier: 0.5
    })
    expect(hint.mode).toBe('relative')
    expect(hint.relativeRange).toEqual({ min: 0.2, max: 0.2 })
    expect(hint.groupRelativeRange).toEqual({ min: 0.3, max: 0.3 })
  })

  it('无 models → by_model，费率 1 不展示次要分组费率', () => {
    const hint = buildGroupPricingHint({ models: null, rateMultiplier: 1 })
    expect(hint.mode).toBe('by_model')
    expect(hint.showSecondaryGroupRate).toBe(false)
  })

  it('无官价且费率非 1 → by_model + 次要分组费率', () => {
    const hint = buildGroupPricingHint({
      models: [tokenModel({ official_pricing: null })],
      rateMultiplier: 0.5
    })
    expect(hint.mode).toBe('by_model')
    expect(hint.showSecondaryGroupRate).toBe(true)
  })
})
