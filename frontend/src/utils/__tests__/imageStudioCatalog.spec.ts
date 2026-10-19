import { describe, expect, it } from 'vitest'
import type { ApiKey } from '@/types'
import { buildImageStudioCatalog, imageModelFamily, isStudioImageModel, keyAllowsImageStudio } from '../imageStudioCatalog'

function key(partial: Partial<ApiKey> & Pick<ApiKey, 'id' | 'key'>): ApiKey {
  return {
    user_id: 1,
    name: 'key',
    group_id: 1,
    status: 'active',
    ip_whitelist: [],
    ip_blacklist: [],
    last_used_at: null,
    last_used_ip: null,
    quota: 0,
    quota_used: 0,
    expires_at: null,
    created_at: '',
    updated_at: '',
    current_concurrency: 0,
    rate_limit_5h: 0,
    rate_limit_1d: 0,
    rate_limit_7d: 0,
    usage_5h: 0,
    usage_1d: 0,
    usage_7d: 0,
    window_5h_start: null,
    window_1d_start: null,
    window_7d_start: null,
    reset_5h_at: null,
    reset_1d_at: null,
    reset_7d_at: null,
    group: {
      id: 1,
      name: 'openai',
      description: null,
      platform: 'openai',
      rate_multiplier: 0.4,
      is_exclusive: false,
      status: 'active',
      subscription_type: 'standard',
      daily_limit_usd: null,
      weekly_limit_usd: null,
      monthly_limit_usd: null,
      long_context_pricing_enabled: false,
      allow_image_generation: true,
      allow_batch_image_generation: false,
      image_rate_independent: false,
      image_rate_multiplier: 1,
      batch_image_discount_multiplier: 1,
      peak_rate_multiplier: 1
    } as ApiKey['group'],
    ...partial
  }
}

describe('image studio catalog', () => {
  it('keeps image models and groups variants by family and rate', () => {
    const groups = buildImageStudioCatalog([
      {
        key: key({ id: 7, key: 'sk-a', name: 'cheap' }),
        models: ['gpt-4o', 'gpt-image-2', 'gpt-image-2-2k', 'gpt-image-2.5-flare']
      }
    ])

    expect(groups.map((group) => group.label)).toEqual(['gpt-image-2-0.4x', 'gpt-image-2.5-0.4x'])
    expect(groups[0].models.map((item) => item.model)).toEqual(['gpt-image-2', 'gpt-image-2-2k'])
    expect(groups[0].models.every((item) => item.apiKey === 'sk-a')).toBe(true)
    expect(groups[1].models.map((item) => item.model)).toEqual(['gpt-image-2.5-flare'])
  })

  it('splits the same model across different rates and keeps one key per model', () => {
    const cheap = key({ id: 1, key: 'sk-cheap' })
    const full = key({
      id: 2,
      key: 'sk-full',
      group: { ...cheap.group!, rate_multiplier: 1 }
    })
    const duplicate = key({ id: 3, key: 'sk-dup' })
    const groups = buildImageStudioCatalog([
      { key: cheap, models: ['gpt-image-2'] },
      { key: full, models: ['gpt-image-2'] },
      { key: duplicate, models: ['gpt-image-2'] }
    ])

    expect(groups.map((group) => group.label)).toEqual(['gpt-image-2', 'gpt-image-2-0.4x'])
    expect(groups[0].models).toHaveLength(1)
    expect(groups[0].models[0].keyId).toBe(2)
    expect(groups[1].models[0].keyId).toBe(1)
  })

  it('uses the independent image rate and ignores keys that cannot generate images', () => {
    const blocked = key({
      id: 4,
      key: 'sk-no',
      group: { ...key({ id: 0, key: 'x' }).group!, allow_image_generation: false }
    })
    const imageRate = key({
      id: 5,
      key: 'sk-img',
      group: {
        ...key({ id: 0, key: 'x' }).group!,
        platform: 'grok',
        rate_multiplier: 1,
        image_rate_independent: true,
        image_rate_multiplier: 0.25
      }
    })

    expect(keyAllowsImageStudio(blocked)).toBe(false)
    expect(isStudioImageModel('gpt-4o')).toBe(false)
    expect(imageModelFamily('grok-imagine-image-quality')).toBe('grok-imagine-image')
    const groups = buildImageStudioCatalog([
      { key: blocked, models: ['gpt-image-2'] },
      { key: imageRate, models: ['grok-imagine-image'] }
    ])
    expect(groups.map((group) => group.label)).toEqual(['grok-imagine-image-0.25x'])
  })
})
