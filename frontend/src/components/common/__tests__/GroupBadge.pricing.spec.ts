import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GroupBadge from '../GroupBadge.vue'

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        if (key === 'keys.pricing.byModel') return '价格按模型'
        if (key === 'keys.pricing.groupRate') return '分组费率'
        if (key === 'keys.pricing.relativeOfficialHint') return `相对官价 ${params?.range}`
        if (key === 'keys.pricing.byModelHint') return 'by-model-hint'
        if (key === 'keys.pricing.groupRateHint') return 'group-rate-hint'
        if (key === 'groups.subscription') return '订阅'
        return key
      }
    })
  }
})

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({ cachedPublicSettings: null })
}))

describe('GroupBadge pricing hints', () => {
  it('有相对官价区间时不展示裸 1x', () => {
    const wrapper = mount(GroupBadge, {
      props: {
        name: 'GPT',
        platform: 'openai',
        rateMultiplier: 1,
        pricingHintMode: 'relative',
        relativeRateMin: 0.1,
        relativeRateMax: 0.7
      },
      global: { stubs: { PlatformIcon: true } }
    })
    expect(wrapper.text()).toContain('0.1x–0.7x')
    expect(wrapper.text()).not.toMatch(/(^|[^.\d])1x([^.]|$)/)
  })

  it('无区间且费率为 1 → 价格按模型', () => {
    const wrapper = mount(GroupBadge, {
      props: {
        name: 'GPT',
        platform: 'openai',
        rateMultiplier: 1,
        pricingHintMode: 'by_model',
        showSecondaryGroupRate: false
      },
      global: { stubs: { PlatformIcon: true } }
    })
    expect(wrapper.text()).toContain('价格按模型')
    expect(wrapper.text()).not.toContain('1x')
  })

  it('无区间且费率 0.5 → 价格按模型 + 次要分组费率', () => {
    const wrapper = mount(GroupBadge, {
      props: {
        name: 'GPT',
        platform: 'openai',
        rateMultiplier: 0.5,
        pricingHintMode: 'by_model',
        showSecondaryGroupRate: true
      },
      global: { stubs: { PlatformIcon: true } }
    })
    expect(wrapper.text()).toContain('价格按模型')
    expect(wrapper.text()).toContain('0.5x')
    expect(wrapper.text()).toContain('分组费率')
  })

  it('未传 pricingHintMode 时保持旧 1x 行为', () => {
    const wrapper = mount(GroupBadge, {
      props: {
        name: 'GPT',
        platform: 'openai',
        rateMultiplier: 1
      },
      global: { stubs: { PlatformIcon: true } }
    })
    expect(wrapper.text()).toContain('1x')
  })
})
